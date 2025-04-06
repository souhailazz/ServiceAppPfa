using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfessionnelController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProfessionnelController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

[HttpGet("metiers-avec-professionnels")]
public async Task<IActionResult> GetMetiersAvecProfessionnels()
{
    var metiers = await _context.ProfessionnelDB
        .GroupBy(p => p.Metier)
        .Select(g => new 
        {
            Metier = g.Key,
            Professionnels = g.Take(4).Select(p => new 
            {
                p.Id,
                p.Utilisateur.Nom,
                p.Utilisateur.Prenom,
                p.Utilisateur.Ville,
                PhotoUrl = _context.PhotoDB
                    .Where(photo => photo.ProfessionnelId == p.Id)
                    .Select(photo => photo.Url)
                    .FirstOrDefault(), // Récupérer une seule photo
                MoyenneNote = _context.EvaluationDB
                    .Where(e => e.ProfessionnelId == p.Id)
                    .Average(e => (double?)e.Note) ?? 0
            }).ToList()
        }).ToListAsync();

    return Ok(metiers);
}
[HttpGet("professionnels-par-metier")]
public async Task<IActionResult> GetProfessionnelsParMetier(string metier, string? ville = null, string? tri = "note")
{
    var query = _context.ProfessionnelDB.Where(p => p.Metier == metier);

    if (!string.IsNullOrEmpty(ville))
    {
        query = query.Where(p => p.Utilisateur.Ville == ville);
    }

    var professionnels = await query
        .Select(p => new 
        {
            p.Id,
            p.Utilisateur.Nom,
            p.Utilisateur.Prenom,
            p.Utilisateur.Ville,
            PhotoUrl = _context.PhotoDB
                .Where(photo => photo.ProfessionnelId == p.Id)
                .Select(photo => photo.Url)
                .FirstOrDefault(), // Récupérer une seule photo
            MoyenneNote = _context.EvaluationDB
                .Where(e => e.ProfessionnelId == p.Id)
                .Average(e => (double?)e.Note) ?? 0
        })
        .OrderByDescending(p => tri == "note" ? p.MoyenneNote : 0) // Tri par note si précisé
        .ToListAsync();

    return Ok(professionnels);
}
[HttpGet("professionnel/{id}")]
public async Task<IActionResult> GetProfessionnel(int id)
{

    var professionnel = await _context.ProfessionnelDB
        .Where(p => p.Id == id)
        .Select(p => new 
        {
            p.Id,
            p.Utilisateur.Nom,
            p.Utilisateur.Prenom,
            p.Metier,
            p.Description,
            p.Tarif,
            p.Disponibilite,
            p.Utilisateur.Ville,
            Photos = _context.PhotoDB
                .Where(photo => photo.ProfessionnelId == p.Id)
                .Select(photo => photo.Url)
                .ToList(), // Récupérer toutes les photos
            Evaluations = _context.EvaluationDB
                .Where(e => e.ProfessionnelId == p.Id)
                .Select(e => new 
                {
                    e.Note,
                    e.Commentaire,
                    e.DateEvaluation,
                    // Accéder au nom du client via la relation Utilisateur
                    ClientNom = e.Client.Utilisateur.Nom,
                    ClientPrenom = e.Client.Utilisateur.Prenom
                }).ToList(),
            MoyenneNote = _context.EvaluationDB
                .Where(e => e.ProfessionnelId == p.Id)
                .Average(e => (double?)e.Note) ?? 0
        })
        .FirstOrDefaultAsync();

    if (professionnel == null)
    {
        return NotFound("Professionnel non trouvé.");
    }

    return Ok(professionnel);
}
[HttpPost("ajouter-photo/{professionnelId}")]
public async Task<IActionResult> AjouterPhoto(int professionnelId, IFormFile file)
{
    // Vérifier si le professionnel existe
    var professionnel = await _context.ProfessionnelDB.FindAsync(professionnelId);
    if (professionnel == null)
    {
        return NotFound("Professionnel non trouvé.");
    }

    // Vérifier si le fichier est valide
    if (file == null || file.Length == 0)
    {
        return BadRequest("Aucun fichier sélectionné.");
    }

    // Générer un nom de fichier unique pour éviter les conflits
    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

    // Assurez-vous que le répertoire existe
    var directory = Path.GetDirectoryName(filePath);
    if (!Directory.Exists(directory))
    {
        Directory.CreateDirectory(directory);
    }

    // Sauvegarder le fichier sur le serveur
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    // Ajouter l'URL de la photo dans la base de données
    var photo = new Photos
    {
        ProfessionnelId = professionnelId,
        Url = $"/uploads/{fileName}" // L'URL de la photo que l'on peut utiliser dans l'API
    };

    _context.PhotoDB.Add(photo);
    await _context.SaveChangesAsync();

    return Ok(new { Message = "Photo ajoutée avec succès.", PhotoUrl = photo.Url });
}
}