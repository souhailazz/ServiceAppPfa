using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Professionnels
{
    [Key]
    public int Id { get; set; } // Clé primaire
    public int UtilisateurId { get; set; } // Clé étrangère vers Utilisateurs
    public string Metier { get; set; }
    public string? Description { get; set; }
    public decimal? Tarif { get; set; }
    public string? Disponibilite { get; set; }

    
    public Utilisateurs Utilisateur { get; set; }
}