public class Professionnels
{
    public int Id { get; set; } // Clé primaire
    public int UtilisateurId { get; set; } // Clé étrangère vers Utilisateurs
    public string Metier { get; set; }
    public string? Description { get; set; }
    public decimal? Tarif { get; set; }
    public string? Disponibilite { get; set; }

    
    public Utilisateur Utilisateur { get; set; }
}