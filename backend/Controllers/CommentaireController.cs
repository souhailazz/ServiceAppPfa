using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CommentairesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CommentairesController(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
[HttpPost("ajouter-commentaire")]
public async Task<IActionResult> AjouterCommentaire([FromBody] CommentaireDto commentaireDto)
{
    // Vérifier si la demande existe
    var demande = await _context.DemandeDB.FindAsync(commentaireDto.DemandeId);
    if (demande == null)
    {
        return NotFound("Demande non trouvée.");
    }

    // Vérifier si l'utilisateur existe
    var utilisateur = await _context.UtilisateurDB.FindAsync(commentaireDto.UtilisateurId);
    if (utilisateur == null)
    {
        return NotFound("Utilisateur non trouvé.");
    }

    // Créer un nouveau commentaire
    var nouveauCommentaire = new Commentaires
    {
        DemandeId = commentaireDto.DemandeId,
        UtilisateurId = commentaireDto.UtilisateurId,
        Contenu = commentaireDto.Contenu,
        DateCommentaire = DateTime.Now
    };

    _context.CommentaireDB.Add(nouveauCommentaire);
    
    // Incrémenter le nombre de commentaires de la demande
    demande.NombreCommentaires++;
    
    await _context.SaveChangesAsync();

    return Ok("Commentaire ajouté avec succès.");
}
[HttpGet("commentaires/{demandeId}")]
public async Task<IActionResult> GetCommentairesByDemande(int demandeId)
{
    var commentaires = await _context.CommentaireDB
        .Where(c => c.DemandeId == demandeId)
        .OrderByDescending(c => c.DateCommentaire)
        .Select(c => new
        {
            c.Id,
            c.Contenu,
            c.DateCommentaire,
            c.UtilisateurId,
            UtilisateurNom = c.Utilisateur.Nom // Récupérer le nom de l'utilisateur
        })
        .ToListAsync();

    if (!commentaires.Any())
    {
        return NotFound("Aucun commentaire trouvé pour cette demande.");
    }

    return Ok(commentaires);
}
[HttpDelete("supprimer-commentaire/{commentaireId}/{utilisateurId}")]
public async Task<IActionResult> SupprimerCommentaire(int commentaireId, int utilisateurId)
{
    var commentaire = await _context.CommentaireDB.FindAsync(commentaireId);
    if (commentaire == null)
    {
        return NotFound("Commentaire non trouvé.");
    }

    // Vérifier si l'utilisateur est bien l'auteur du commentaire
    if (commentaire.UtilisateurId != utilisateurId)
    {
        return Forbid("Vous ne pouvez pas supprimer un commentaire qui ne vous appartient pas.");
    }

    var demande = await _context.DemandeDB.FindAsync(commentaire.DemandeId);
    if (demande != null)
    {
        demande.NombreCommentaires--; // Décrémenter le compteur
    }

    _context.CommentaireDB.Remove(commentaire);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Commentaire supprimé avec succès.",
        NombreCommentaires = demande?.NombreCommentaires
    });
}
}
public class CommentaireDto
{
    public int DemandeId { get; set; }
    public int UtilisateurId { get; set; }
    public string Contenu { get; set; }
}