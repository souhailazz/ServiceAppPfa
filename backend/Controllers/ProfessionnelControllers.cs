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
        .Where(p => p.UtilisateurId == id)
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

}