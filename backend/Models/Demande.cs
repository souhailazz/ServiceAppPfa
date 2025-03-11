public class Demande
{
    public int Id { get; set; } 
    public int ClientId { get; set; } 
    public string Titre { get; set; }
    public string? Description { get; set; }
    public string? Ville { get; set; }
    public DateTime DatePublication { get; set; } = DateTime.Now;

    
    public Client Client { get; set; }
}