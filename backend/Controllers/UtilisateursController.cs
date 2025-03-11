using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UtilisateursController : ControllerBase
{
    private readonly AppDbContext _context;

    public UtilisateursController(AppDbContext context)
    {
        _context = context;
    }

    // API pour enregistrer un utilisateur
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Utilisateurs utilisateur)
    {
        if (string.IsNullOrEmpty(utilisateur.Nom) || string.IsNullOrEmpty(utilisateur.Prenom) || 
            string.IsNullOrEmpty(utilisateur.Email) || string.IsNullOrEmpty(utilisateur.MotDePasseHash))
        {
            return BadRequest("Tous les champs sont requis.");
        }

        // Vérification du format de l'email
     

        // Vérification si l'email existe déjà
        var existingUser = await _context.UtilisateurDB.FirstOrDefaultAsync(u => u.Email == utilisateur.Email);
        if (existingUser != null)
        {
            return BadRequest("Un utilisateur avec cet email existe déjà.");
        }

        // Hachage du mot de passe
        var motDePasseHash = HashPassword(utilisateur.MotDePasseHash);
        utilisateur.MotDePasseHash = motDePasseHash;

        // Créer l'utilisateur
        _context.UtilisateurDB.Add(utilisateur);
        await _context.SaveChangesAsync();  // L'utilisateur est maintenant ajouté et son ID est généré

        // Si l'ID est généré, il est disponible ici
        if (utilisateur.Role.ToLower() == "professionnel")
        {
            // Créer un professionnel
            var professionnel = new Professionnels
            {
                UtilisateurId = utilisateur.Id,  // L'ID est maintenant disponible
                Metier = "Metier exemple", // Exemple, tu devras récupérer ça depuis le frontend ou demander à l'utilisateur de le préciser.
                Tarif = 100.0m, // Exemple, idem, demande à l'utilisateur de définir cela.
                Disponibilite = "Disponible" // Par défaut ou dynamique selon l'utilisateur
            };

            _context.ProfessionnelDB.Add(professionnel);
            await _context.SaveChangesAsync();
        }
        else if (utilisateur.Role.ToLower() == "client")
        {
            // Créer un client
            var client = new Clients
            {
                UtilisateurId = utilisateur.Id  // L'ID est maintenant disponible
            };

            _context.ClientDB.Add(client);
            await _context.SaveChangesAsync();
        }
        else
        {
            return BadRequest("Le rôle doit être soit 'professionnel' soit 'client'.");
        }

        return Ok(new { Message = "Utilisateur créé avec succès", UtilisateurId = utilisateur.Id });
    }

    // Méthode simple pour hacher le mot de passe
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashBytes);
        }
    }
}