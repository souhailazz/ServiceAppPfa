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
        if (string.IsNullOrEmpty(demandeDto.Titre) || string.IsNullOrEmpty(demandeDto.Description) ||
            string.IsNullOrEmpty(demandeDto.Ville) || demandeDto.ClientId <= 0)
        {
            return BadRequest("Tous les champs sont requis.");
        }

        // Création de la demande
        var nouvelleDemande = new Demandes
        {
            ClientId = demandeDto.ClientId,
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
}

public class DemandeDto
{
    public int ClientId { get; set; }
    public string Titre { get; set; }
    public string Description { get; set; }
    public string Ville { get; set; }   
   
}
