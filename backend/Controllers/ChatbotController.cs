using backend.Data;
using backend.Models;
using backend.Models.Dtos;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient = new();

        public ChatbotController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatbotRequest request)
        {
            var message = request.Message.ToLower();

            var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == request.UtilisateurId);
            if (client == null)
                return Unauthorized("Aucun client associé à cet utilisateur.");

            var df = await AppelerDialogflow(request.Message);

            string? metier = null;
            string? ville = null;

            if (df.queryResult.parameters.TryGetValue("metier", out var metierElement))
            {
                metier = ExtractStringFromJsonElement(metierElement);
            }

            if (df.queryResult.parameters.TryGetValue("ville", out var villeElement) ||
                df.queryResult.parameters.TryGetValue("location", out villeElement))
            {
                ville = ExtractStringFromJsonElement(villeElement);
            }

            var intent = df.queryResult.intent?.displayName;
            string reponseFinale;

            if (intent == "TrouverProfessionnel" && metier != null && ville != null)
            {
                var pros = await _context.ProfessionnelDB
                    .Include(p => p.Utilisateur)
                    .Where(p => p.Metier.ToLower() == metier.ToLower() && p.Utilisateur.Ville.ToLower() == ville.ToLower())
                    .ToListAsync();

                if (pros.Any())
                {
                    var professionnels = pros.Select(p => new {
                        id = p.Id,
                        prenom = p.Utilisateur.Prenom,
                        nom = p.Utilisateur.Nom,
                        telephone = p.Utilisateur.Telephone ?? "Non renseigné",
                        ville = p.Utilisateur.Ville ?? "",
                        metier = p.Metier ?? "",
                        photo = _context.PhotoDB.Where(photo => photo.ProfessionnelId == p.Id).Select(photo => photo.Url).FirstOrDefault() ?? "",
                        note = _context.EvaluationDB.Where(e => e.ProfessionnelId == p.Id).Average(e => (double?)e.Note) ?? 0,
                        disponibilite = p.Disponibilite ?? "",
                        tarif = p.Tarif ?? 0
                    }).ToList();

                    var reponseObj = new {
                        reponse = $"Voici des {metier}s disponibles à {ville} :",
                        professionnels,
                        intent = intent
                    };

                    var chatRecord = new Chatbot
                    {
                        UtilisateurId = request.UtilisateurId,
                        Message = request.Message,
                        Reponse = reponseObj.reponse,
                        DateInteraction = DateTime.Now
                    };

                    _context.Chatbots.Add(chatRecord);
                    await _context.SaveChangesAsync();

                    return Ok(reponseObj);
                }
                else
                {
                    reponseFinale = $"Désolé, aucun {metier} trouvé à {ville} pour le moment.";
                }
            }
            else if (intent == "CreerDemande")
            {
                var titre = df.queryResult.parameters.TryGetValue("titre", out var titreElement) ? ExtractStringFromJsonElement(titreElement) : null;
                var description = df.queryResult.parameters.TryGetValue("description", out var descElement) ? ExtractStringFromJsonElement(descElement) : null;
                var villeDemande = df.queryResult.parameters.TryGetValue("ville", out var villeDemandeElement) ? ExtractStringFromJsonElement(villeDemandeElement) : null;

                if (!string.IsNullOrEmpty(titre) && !string.IsNullOrEmpty(description) && !string.IsNullOrEmpty(villeDemande))
                {
                    var demande = new Demandes
                    {
                        Titre = titre,
                        Description = description,
                        Ville = villeDemande,
                        DatePublication = DateTime.Now,
                        ClientId = request.UtilisateurId,
                        Photos = new List<Photos>()
                    };
                    _context.DemandeDB.Add(demande);
                    await _context.SaveChangesAsync();

                    return Ok(new { reponse = "Votre demande a bien été créée !", intent = intent });
                }
                else
                {
                    return Ok(new { reponse = df.queryResult.fulfillmentText, intent = intent });
                }
            }
            else if (intent == "Aide" || message.Contains("problème") || message.Contains("aide"))
            {
                reponseFinale = "Pouvez-vous me préciser le métier ou la ville concernée ? Par exemple : \"J'ai un problème avec un électricien à Casablanca\".";
            }
            else if (!string.IsNullOrEmpty(intent))
            {
                reponseFinale = "Je n'ai pas compris votre demande. Essayez avec : \"Je cherche un plombier à Rabat\".";
            }
            else
            {
                reponseFinale = "Je n'ai pas compris votre demande. Essayez avec : \"Je cherche un plombier à Rabat\".";
            }

            var chat = new Chatbot
            {
                UtilisateurId = request.UtilisateurId,
                Message = request.Message,
                Reponse = reponseFinale,
                DateInteraction = DateTime.Now
            };

            _context.Chatbots.Add(chat);
            await _context.SaveChangesAsync();

            return Ok(new { reponse = reponseFinale, intent = intent });
        }

        private async Task<DialogflowResponse> AppelerDialogflow(string message)
        {
            var projectId = "assistantmetiers-enep";
            var sessionId = Guid.NewGuid().ToString();
            var url = $"https://dialogflow.googleapis.com/v2/projects/{projectId}/agent/sessions/{sessionId}:detectIntent";

            GoogleCredential credential;
            using (var stream = new FileStream("Secrets/dialogflow-key.json", FileMode.Open, FileAccess.Read))
            {
                credential = GoogleCredential.FromStream(stream)
                    .CreateScoped("https://www.googleapis.com/auth/dialogflow");
            }

            var accessToken = await credential.UnderlyingCredential.GetAccessTokenForRequestAsync();

            var body = new
            {
                queryInput = new
                {
                    text = new
                    {
                        text = message,
                        languageCode = "fr"
                    }
                }
            };

            var json = JsonSerializer.Serialize(body);
            var requestHttp = new HttpRequestMessage(HttpMethod.Post, url);
            requestHttp.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            requestHttp.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestHttp);
            var content = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<DialogflowResponse>(content);
        }

        private string? ExtractStringFromJsonElement(JsonElement element)
        {
            if (element.ValueKind == JsonValueKind.String)
            {
                return element.GetString();
            }
            else if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty("city", out var cityProp))
            {
                return cityProp.GetString();
            }
            else if (element.ValueKind == JsonValueKind.Array && element.GetArrayLength() > 0)
            {
                return element[0].GetString();
            }

            return null;
        }

        [HttpPost("creer-demande-chatbot")]
        public async Task<IActionResult> CreerDemandeViaChatbot([FromBody] CreateDemandeFromChatbotDto dto)
        {
            var utilisateurExiste = await _context.ClientDB.AnyAsync(c => c.UtilisateurId == dto.UtilisateurId);
            if (!utilisateurExiste)
                return Unauthorized("Aucun utilisateur valide fourni.");

            var demande = new Demandes
            {
                Titre = dto.Titre,
                Description = dto.Description,
                Ville = dto.Ville,
                DatePublication = DateTime.Now,
                ClientId = dto.UtilisateurId,
                Photos = new List<Photos>()
            };

            _context.DemandeDB.Add(demande);
            await _context.SaveChangesAsync();

             //  kansifto  les professionnels notifications ela hsab demande wach kathmo 
            if (!string.IsNullOrEmpty(dto.Metier))
            {
                var professionnelsCibles = await _context.ProfessionnelDB
                    .Include(p => p.Utilisateur)
                    .Where(p => 
                        p.Metier.ToLower() == dto.Metier.ToLower() &&
                        p.Utilisateur.Ville.ToLower() == dto.Ville.ToLower())
                    .ToListAsync();

                foreach (var professionnel in professionnelsCibles)
                {
                    var notification = new Notification
                    {
                        Titre = $"Nouveau projet de {dto.Metier} disponible",
                        Message = $"Un client a publié une demande à {dto.Ville}.",
                        ProfessionnelId = professionnel.Id,
                        DateNotification = DateTime.Now,
                        EstLue = false
                    };

                    _context.NotificationDB.Add(notification);
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Demande créée avec succès et notifications envoyées !", demande.Id });
        }
    }
}
