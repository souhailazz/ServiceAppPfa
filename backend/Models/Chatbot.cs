using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Chatbot
{
    [Key]
    public int Id { get; set; }
    public int UtilisateurId { get; set; } 
    public string Message { get; set; }
    public string? Reponse { get; set; }
    public DateTime DateInteraction { get; set; } = DateTime.Now;

    public Utilisateurs Utilisateur { get; set; }
}