using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.Dtos
{
    public class ChatbotRequest
    {
        public int UtilisateurId { get; set; }
        public string Message { get; set; }
    }
}