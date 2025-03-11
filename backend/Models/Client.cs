using backend.Models;
namespace backend.Models;

public class Clients
{
    public int Id { get; set; } 
    public int UtilisateurId { get; set; } 

    
    public Utilisateurs Utilisateur { get; set; }
}