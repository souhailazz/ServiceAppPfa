using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Clients
{
    [Key]
    public int Id { get; set; } 
    public int UtilisateurId { get; set; } 

    
    public Utilisateurs Utilisateur { get; set; }
}