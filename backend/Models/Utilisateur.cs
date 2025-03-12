using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;



public class Utilisateurs
{
    [Key]
    public int Id { get; set; } // Clé primaire
    public string Nom { get; set; }
    public string Prenom { get; set; }
    public string Email { get; set; }
    public string MotDePasseHash { get; set; }
    public string? Telephone { get; set; }
    public string? Ville { get; set; }
    public string Role { get; set; }
    
    
}