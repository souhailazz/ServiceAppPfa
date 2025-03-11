using backend.Models;
namespace backend.Models;

public class Demandes
{
    public int Id { get; set; } 
    public int ClientId { get; set; } 
    public string Titre { get; set; }
    public string? Description { get; set; }
    public string? Ville { get; set; }
    public DateTime DatePublication { get; set; } = DateTime.Now;

    
    public Clients Client { get; set; }
}