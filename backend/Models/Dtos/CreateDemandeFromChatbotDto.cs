namespace backend.Models.Dtos
{
    public class CreateDemandeFromChatbotDto
    {
        public int UtilisateurId { get; set; }
        public string Titre { get; set; }
        public string Description { get; set; }
        public string Ville { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Metier { get; set; }
    }
}
