using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Titre { get; set; }

        [Required]
        public string Message { get; set; }

        public DateTime DateNotification { get; set; } = DateTime.Now;

        [ForeignKey("Professionnels")]
        public int ProfessionnelId { get; set; }

        public Professionnels Professionnel { get; set; }

        public bool EstLue { get; set; } = false;
    }
}
