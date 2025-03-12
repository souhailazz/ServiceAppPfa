namespace backend.Models;

    public class RegisterDto
    {
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Email { get; set; }
         public string MotDePasseHash { get; set; }

        public string Role { get; set; }
         public string? Telephone { get; set; }
    public string? Ville { get; set; }

        
        public string? Metier { get; set; }
                public string? Description { get; set; }

        public decimal? Tarif { get; set; }
        public string? Disponibilite { get; set; }
    }



