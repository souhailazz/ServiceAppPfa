using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Demandes
{
    [Key]
    public int Id { get; set; } 
    public int ClientId { get; set; } 
    public string Titre { get; set; }
    public string? Description { get; set; }
    public string? Ville { get; set; }
    public DateTime DatePublication { get; set; } = DateTime.Now;
   public int NombreCommentaires   {get;set;}
    
    public Clients Client { get; set; }
}