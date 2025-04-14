using backend.Data;
using backend.Models;
using backend.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatbotController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatbotRequest request)
        {
            var message = request.Message.ToLower();

            // Vérifier si l'utilisateur est un client
            var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == request.UtilisateurId);
            if (client == null)
                return Unauthorized("Aucun client associé à cet utilisateur.");

            // Liste des métiers possibles
            var metiers = new[] { "plombier", "electricien", "menuisier", "mecanicien", "tolier", "jardinier", "peintre" };

            string? metierTrouve = metiers.FirstOrDefault(m => message.Contains(m));
            string? villeTrouvee = ExtraireVille(message);

            string reponseFinale;

           if (metierTrouve != null && villeTrouvee != null)
{
    var pros = await _context.ProfessionnelDB
        .Include(p => p.Utilisateur)
        .Where(p => p.Metier.ToLower() == metierTrouve && p.Utilisateur.Ville.ToLower() == villeTrouvee)
        .ToListAsync();

    if (pros.Any())
    {
        reponseFinale = $"Voici des {metierTrouve}s disponibles à {villeTrouvee} :\n\n" +
            string.Join("\n", pros.Select(p =>
                $"- {p.Utilisateur.Prenom} {p.Utilisateur.Nom} |  {p.Utilisateur.Telephone ?? "Non renseigné"}"));
    }
    else
    {
        reponseFinale = $"Désolé, aucun {metierTrouve} trouvé à {villeTrouvee} pour le moment.";
    }
}
            else if (message.Contains("problème") || message.Contains("comment") || message.Contains("aide"))
            {
                // Réponse basique d'aide pour des problèmes
                reponseFinale = "Pouvez-vous me préciser le métier ou la ville concernée par votre problème ? Par exemple : \"J’ai un problème électrique à Casablanca\".";
            }
            else
            {
                reponseFinale = "Je n’ai pas compris votre demande. Veuillez préciser le métier et la ville, comme : \"Je cherche un électricien à Rabat\".";
            }

            // Sauvegarder la conversation
            var chat = new Chatbot
            {
                UtilisateurId = request.UtilisateurId,
                Message = request.Message,
                Reponse = reponseFinale,
                DateInteraction = DateTime.Now
            };
            _context.Chatbots.Add(chat);
            await _context.SaveChangesAsync();

            return Ok(new { reponse = reponseFinale });
        }

        private string? ExtraireVille(string message)
        {
            var villesConnues = new[] { "casablanca", "rabat", "marrakech", "tanger", "fes", "agadir" };
            foreach (var ville in villesConnues)
            {
                if (message.ToLower().Contains(ville))
                    return ville;
            }

            // Optionnel : extraire ville via regex ou NLP plus avancé
            return null;
        }
    }

    public class ChatbotRequest
    {
        public int UtilisateurId { get; set; }
        public string Message { get; set; }
    }
}
