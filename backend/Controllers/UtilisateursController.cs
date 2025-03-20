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

    [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
{
    if (string.IsNullOrEmpty(registerDto.Nom) || string.IsNullOrEmpty(registerDto.Prenom) ||
        string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Role) ||
        string.IsNullOrEmpty(registerDto.MotDePasseHash))
    {
        return BadRequest("Les champs obligatoires sont requis.");
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
        MotDePasseHash = HashPassword(registerDto.MotDePasseHash),
        Telephone = registerDto.Telephone,
        Ville = registerDto.Ville,
        Role = registerDto.Role
    };

    _context.UtilisateurDB.Add(utilisateur);
    await _context.SaveChangesAsync();

    if (utilisateur.Role.ToLower() == "professionnel")
    {
        // Vérifier les champs requis pour un professionnel
        if (string.IsNullOrEmpty(registerDto.Metier) || !registerDto.Tarif.HasValue || 
            string.IsNullOrEmpty(registerDto.Disponibilite) || string.IsNullOrEmpty(registerDto.Description))
        {
            // Si nécessaire, on pourrait supprimer l'utilisateur déjà créé
            return BadRequest("Les informations professionnelles sont incomplètes.");
        }
        
        // Créer un professionnel
        var professionnel = new Professionnels
        {
            UtilisateurId = utilisateur.Id,
            Metier = registerDto.Metier,
            Description = registerDto.Description,
            Tarif = registerDto.Tarif.Value,
            Disponibilite = registerDto.Disponibilite
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

    return Ok(new { Message = "Utilisateur créé avec succès", UtilisateurId = utilisateur.Id, Role = utilisateur.Role });
}
    // API pour la connexion de l'utilisateur
  [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
{
    if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.MotDePasse))
    {
        Console.WriteLine("Login failed: Email or password is empty");
        return BadRequest("Email et mot de passe sont requis.");
    }

    var utilisateur = await _context.UtilisateurDB.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
    if (utilisateur == null)
    {
        Console.WriteLine($"Login failed: User with email {loginDto.Email} not found");
        return Unauthorized("Email ou mot de passe incorrect.");
    }
    
    if (utilisateur.MotDePasseHash != HashPassword(loginDto.MotDePasse))
    {
        Console.WriteLine($"Login failed: Password incorrect for user {loginDto.Email}");
        return Unauthorized("Email ou mot de passe incorrect.");
    }

    // Stocker l'ID de l'utilisateur dans la session
    _httpContextAccessor.HttpContext.Session.SetInt32("UtilisateurId", utilisateur.Id);
    
    Console.WriteLine($"Login successful: User ID {utilisateur.Id}, Role {utilisateur.Role}");
    
return Ok(new { Message = "Connexion réussie", UtilisateurId = utilisateur.Id, Role = utilisateur.Role });}
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

    [HttpPost("upload-photo/{utilisateurId}")]
    public async Task<IActionResult> UploadPhoto(int utilisateurId, IFormFile file)
    {
        var professionnel = await _context.ProfessionnelDB.FirstOrDefaultAsync(p => p.UtilisateurId == utilisateurId);
        if (professionnel == null)
        {
            return NotFound("Professionnel non trouvé.");
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("Aucune image n'a été envoyée.");
        }

        // Générer un nom de fichier unique pour éviter les conflits
        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        string filePath = Path.Combine("wwwroot/uploads", fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        string photoUrl = "/uploads/" + fileName;

        // Ajouter la photo dans la table Photos avec l'ID du professionnel
        var photo = new Photos
        {
            Url = photoUrl,
            ProfessionnelId = professionnel.Id
        };

        _context.PhotoDB.Add(photo);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Photo uploadée avec succès", PhotoUrl = photo.Url });
    }
}

public class LoginDto
{
    public string Email { get; set; }
    public string MotDePasse { get; set; }
}
