using backend.Models;
using backend.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Net.Http.Headers;
using System.Net.Http;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Remplacez par votre clé API Hugging Face ici

        public ChatbotController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatbotRequest request, [FromForm] userDto userDto)
        {
            var prompt = request.Message;

            // Récupérer le client associé à l'utilisateur
            var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == request.UtilisateurId);
            if (client == null)
            {
                return Unauthorized("Aucun client associé à cet utilisateur.");
            }

            // Créer une instance HttpClient pour appeler l'API Hugging Face
            using (var httpClient = new HttpClient())
            {
                // Ajouter l'en-tête Authorization pour la clé API Hugging Face
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _huggingFaceApiKey);

                // Créer le contenu de la requête (prompt)
                var content = new StringContent(JsonConvert.SerializeObject(new
                {
                    inputs = prompt
                }), Encoding.UTF8, "application/json");

                // Appeler l'API Hugging Face (modèle GPT-2 ou GPT-Neo)
                var response = await httpClient.PostAsync("https://api-inference.huggingface.co/models/gpt2", content);
                var resultJson = await response.Content.ReadAsStringAsync();

                // Ajouter un diagnostic pour vérifier le contenu de la réponse
                if (!response.IsSuccessStatusCode)
                {
                    // Si la réponse n'est pas correcte, retournez le contenu brut pour déboguer
                    return BadRequest($"Erreur de l'API : {resultJson}");
                }

                // Vérifier si la réponse est valide JSON
                try
                {
                    // Tenter de désérialiser la réponse
                    var responseText = JsonConvert.DeserializeObject<dynamic>(resultJson)[0].generated_text.ToString();

                    // Sauvegarder l'interaction dans la base de données
                    var interaction = new Chatbot
                    {
                        UtilisateurId = request.UtilisateurId,
                        Message = prompt,
                        Reponse = responseText,
                        DateInteraction = DateTime.Now
                    };

                    _context.Chatbots.Add(interaction);
                    await _context.SaveChangesAsync();

                    return Ok(new { reponse = responseText });
                }
                catch (JsonReaderException ex)
                {
                    // Si une erreur de JSON se produit, afficher le contenu brut
                    return BadRequest($"Erreur de parsing JSON : {ex.Message}, Contenu brut : {resultJson}");
                }
            }
        }
    }

    // DTO pour l'utilisateur
    public class userDto
    {
        public int UserId { get; set; }
    }
}

