using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EvaluationController : ControllerBase
{
    private readonly AppDbContext _context;

    public EvaluationController(AppDbContext context)
    {
        _context = context;
    }

    
 [HttpPost]
public async Task<IActionResult> AjouterEvaluation([FromBody] EvaluationDTO evaluation)
{
    // Récupère l'ID de l'utilisateur connecté
   
    var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == evaluation.ClientId);  //clientID == utilsateur id
    if (client == null)
    {
        return Unauthorized("Aucun client associé à cet utilisateur.");
    }

    // Vérifie que le professionnel existe
    var professionnelExiste = await _context.ProfessionnelDB.AnyAsync(p => p.Id == evaluation.ProfessionnelId);
    if (!professionnelExiste)
    {
        return NotFound("Professionnel non trouvé.");
    }

    // Crée et ajoute l’évaluation
    var nouvelleEvaluation = new Evaluations
    {
        ProfessionnelId = evaluation.ProfessionnelId,
        ClientId = client.Id,
        Note = evaluation.Note,
        Commentaire = evaluation.Commentaire,
        DateEvaluation = DateTime.Now
    };

    _context.EvaluationDB.Add(nouvelleEvaluation);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Évaluation ajoutée avec succès." });
}


    [HttpGet("professionnel/{professionnelId}")]
    public async Task<IActionResult> GetEvaluationsPourProfessionnel(int professionnelId)
    {
        var evaluations = await _context.EvaluationDB
            .Where(e => e.ProfessionnelId == professionnelId)
            .Select(e => new {
                e.Id,
                e.Note,
                e.Commentaire,
                e.DateEvaluation,
                ClientNom = e.Client.Utilisateur.Nom,
                ClientPrenom = e.Client.Utilisateur.Prenom
            })
            .ToListAsync();

        return Ok(evaluations);
    }
    [HttpPut("{evaluationId}")]
public async Task<IActionResult> ModifierEvaluation(int evaluationId, [FromBody] EvaluationDTO evaluationDto)
{
    var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == evaluationDto.ClientId);
    if (client == null)
    {
        return Unauthorized("Aucun client associé à cet utilisateur.");
    }

    var evaluation = await _context.EvaluationDB.FirstOrDefaultAsync(e => e.Id == evaluationId && e.ClientId == client.Id);
    if (evaluation == null)
    {
        return NotFound("Évaluation non trouvée ou vous n'êtes pas autorisé à la modifier.");
    }

    evaluation.Note = evaluationDto.Note;
    evaluation.Commentaire = evaluationDto.Commentaire;
    evaluation.DateEvaluation = DateTime.Now; // Optionnel : mettre à jour la date

    await _context.SaveChangesAsync();

    return Ok(new { message = "Évaluation modifiée avec succès." });
}
[HttpDelete("{evaluationId}")]
public async Task<IActionResult> SupprimerEvaluation(int evaluationId, [FromQuery] int clientId)
{
    var client = await _context.ClientDB.FirstOrDefaultAsync(c => c.UtilisateurId == clientId);
    if (client == null)
    {
        return Unauthorized("Aucun client associé à cet utilisateur.");
    }

    var evaluation = await _context.EvaluationDB.FirstOrDefaultAsync(e => e.Id == evaluationId && e.ClientId == client.Id);
    if (evaluation == null)
    {
        return NotFound("Évaluation non trouvée ou vous n'êtes pas autorisé à la supprimer.");
    }

    _context.EvaluationDB.Remove(evaluation);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Évaluation supprimée avec succès." });
}

}

public class EvaluationDTO
{


    public int ProfessionnelId { get; set; } // Clé étrangère vers Professionnels
    public int ClientId { get; set; } // Clé étrangère vers Clients
    public int Note { get; set; }
    public string? Commentaire { get; set; }
   
}