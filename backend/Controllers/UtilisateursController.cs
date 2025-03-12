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
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UtilisateursController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    // API pour enregistrer un utilisateur
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (string.IsNullOrEmpty(registerDto.Nom) || string.IsNullOrEmpty(registerDto.Prenom) ||
            string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Role))
        {
            return BadRequest("Tous les champs sont requis.");
        }

        var existingUser = await _context.UtilisateurDB.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
        if (existingUser != null)
        {
            return BadRequest("Un utilisateur avec cet email existe déjà.");
        }

        // Créer et enregistrer l'utilisateur
        var utilisateur = new Utilisateurs
        {
            Nom = registerDto.Nom,
            Prenom = registerDto.Prenom,
            Email = registerDto.Email,
            Role = registerDto.Role,
            MotDePasseHash = HashPassword(registerDto.MotDePasseHash) // Utiliser un vrai mot de passe haché
        };

        _context.UtilisateurDB.Add(utilisateur);
        await _context.SaveChangesAsync();

        if (utilisateur.Role.ToLower() == "professionnel")
        {
            // Créer un professionnel
            var professionnel = new Professionnels
            {
                UtilisateurId = utilisateur.Id,
                Metier = registerDto.Metier ?? "Non spécifié",
                Tarif = registerDto.Tarif ?? 0.0m,
                Disponibilite = registerDto.Disponibilite ?? "Non spécifié"
            };

            _context.ProfessionnelDB.Add(professionnel);
            await _context.SaveChangesAsync();
        }
        else if (utilisateur.Role.ToLower() == "client")
        {
            // Créer un client
            var client = new Clients
            {
                UtilisateurId = utilisateur.Id
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

    // API pour la connexion de l'utilisateur
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.MotDePasse))
        {
            return BadRequest("Email et mot de passe sont requis.");
        }

        var utilisateur = await _context.UtilisateurDB.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        if (utilisateur == null || utilisateur.MotDePasseHash != HashPassword(loginDto.MotDePasse))
        {
            return Unauthorized("Email ou mot de passe incorrect.");
        }

        // Stocker l'ID de l'utilisateur dans la session
        _httpContextAccessor.HttpContext.Session.SetInt32("UtilisateurId", utilisateur.Id);

        return Ok(new { Message = "Connexion réussie", UtilisateurId = utilisateur.Id, Role = utilisateur.Role });
    }

    // API pour récupérer l'utilisateur connecté
    [HttpGet("session-user")]
    public IActionResult GetSessionUser()
    {
        var utilisateurId = _httpContextAccessor.HttpContext.Session.GetInt32("UtilisateurId");
        if (utilisateurId == null)
        {
            return Unauthorized("Aucun utilisateur connecté.");
        }
        return Ok(new { UtilisateurId = utilisateurId });
    }

    // API pour déconnecter l'utilisateur
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        _httpContextAccessor.HttpContext.Session.Clear();
        return Ok(new { Message = "Déconnexion réussie" });
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

// DTO pour la connexion
public class LoginDto
{
    public string Email { get; set; }
    public string MotDePasse { get; set; }
}
