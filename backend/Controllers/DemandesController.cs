using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DemandesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DemandesController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateDemande([FromForm] DemandeDto demandeDto, [FromForm] List<IFormFile> photos)
    {
         

    var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == demandeDto.ClientId );//CLIENTID == userId;
    
    if (client == null)
    {
        return Unauthorized("Aucun client associé à cet utilisateur.");
    }

    if (string.IsNullOrEmpty(demandeDto.Titre) || string.IsNullOrEmpty(demandeDto.Description) ||
        string.IsNullOrEmpty(demandeDto.Ville))
    {
        return BadRequest("Tous les champs sont requis.");
    }

        // Création de la demande
        var nouvelleDemande = new Demandes
        {
            ClientId = client.Id,
            Titre = demandeDto.Titre,
            Description = demandeDto.Description,
            Ville = demandeDto.Ville,
            DatePublication = DateTime.Now,
            NombreCommentaires = 0
        };

        _context.DemandeDB.Add(nouvelleDemande);
        await _context.SaveChangesAsync(); // Enregistre la demande pour obtenir l'ID

        // Gérer les photos
        List<string> photoUrls = new List<string>();
        if (photos != null && photos.Count > 0)
        {
            foreach (var photo in photos)
            {
                var photoUrl = await UploadPhoto(photo);
                if (!string.IsNullOrEmpty(photoUrl))
                {
                    photoUrls.Add(photoUrl);

                    var photoEntity = new Photos
                    {
                        Url = photoUrl,
                        DemandeId = nouvelleDemande.Id
                    };
                    _context.PhotoDB.Add(photoEntity);
                }
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            Message = "Demande créée avec succès",
            DemandeId = nouvelleDemande.Id,
            Photos = photoUrls
        });
    }

    private async Task<string> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return null;

        // Vérifier le type de fichier (ex: images uniquement)
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
            return null; // Rejeter le fichier s'il n'est pas une image

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var fileName = Guid.NewGuid().ToString() + fileExtension;
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Retourne une URL accessible
        return $"/uploads/{fileName}";
    }

    [HttpGet("all-demande")]
    public async Task<IActionResult> GetDemandes()
    {
        var demandes = await _context.DemandeDB
            .OrderByDescending(d => d.DatePublication)
            .Include(d => d.Photos)
            .Select(d => new
            {
                d.Id,
                d.Titre,
                d.Description,
                d.Ville,
                d.DatePublication,
                photoUrll = d.Photos.Select(p => p.Url).ToList()
            })
            .ToListAsync();

        if (demandes == null || !demandes.Any())
        {
            return NotFound("Aucune demande trouvée.");
        }

        return Ok(demandes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDemandeById(int id)
    {
        var demande = await _context.DemandeDB
            .Include(d => d.Photos)
            .Where(d => d.Id == id)
            .Select(d => new
            {
                d.Id,
                d.Titre,
                d.Description,
                d.Ville,
                d.DatePublication,
                photoUrll = d.Photos.Select(p => p.Url).ToList()
            })
            .FirstOrDefaultAsync();

        if (demande == null)
        {
            return NotFound("Demande non trouvée.");
        }

        return Ok(demande);
    }
  [HttpDelete("{id}")]
public async Task<IActionResult> DeleteDemande(int id)
{
    var demande = await _context.DemandeDB.FindAsync(id);
    if (demande == null)
    {
        return NotFound("Demande non trouvée.");
    }

    // Supprimer les photos associées dans la base de données
    var photos = _context.PhotoDB.Where(p => p.DemandeId == id);
    _context.PhotoDB.RemoveRange(photos);

    // Supprimer la demande
    _context.DemandeDB.Remove(demande);
    await _context.SaveChangesAsync();

    return Ok("Demande et ses photos supprimées avec succès.");
}
[HttpGet("client/{UserId}")]
public async Task<IActionResult> GetDemandesByClient(int UserId)
{
    var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == UserId);
    
    if (client == null)
    {
        return NotFound("Client non trouvé.");
    }

    var demandes = await _context.DemandeDB
        .Where(d => d.ClientId == client.Id)
        .Include(d => d.Photos)
        .OrderByDescending(d => d.DatePublication)
        .Select(d => new
        {
            d.Id,
            d.Titre,
            d.Description,
            d.Ville,
            d.DatePublication,
            photoUrll = d.Photos.Select(p => p.Url).ToList()
        })
        .ToListAsync();

    if (!demandes.Any())
    {
        return NotFound("Aucune demande trouvée pour ce client.");
    }

    return Ok(demandes);
}
[HttpPut("{id}")]
public async Task<IActionResult> UpdateDemande(int id, [FromBody] DemandeDto updatedDemande)
{
    var demande = await _context.DemandeDB.FindAsync(id);
    if (demande == null)
    {
        return NotFound("Demande non trouvée.");
    }

    demande.Titre = updatedDemande.Titre;
    demande.Description = updatedDemande.Description;
    demande.Ville = updatedDemande.Ville;

    await _context.SaveChangesAsync();
    return Ok("Demande mise à jour avec succès.");
}

}
public class DemandeDto
{
    public int ClientId { get; set; }
    public string Titre { get; set; }
    public string Description { get; set; }
    public string Ville { get; set; }   
   
}
