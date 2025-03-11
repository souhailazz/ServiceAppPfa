public class Chatbot
{
    public int Id { get; set; }
    public int UtilisateurId { get; set; } 
    public string Message { get; set; }
    public string? Reponse { get; set; }
    public DateTime DateInteraction { get; set; } = DateTime.Now;

    public Utilisateur Utilisateur { get; set; }
}