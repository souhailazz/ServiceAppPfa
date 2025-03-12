using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Charger les variables d'environnement
builder.Configuration.AddEnvironmentVariables();

// Récupérer le serveur de la base de données depuis l'environnement
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? "localhost"; // Default à "localhost" si non défini

// Construire dynamiquement la connexion à la base de données
var connectionString = $"Server={dbServer};Database=SiteDB;Trusted_Connection=True;TrustServerCertificate=True";

// Ajouter les services pour les contrôleurs
builder.Services.AddControllers();

// Ajouter la connexion à la base de données
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// Ajouter les services pour Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API de Gestion des Utilisateurs",
        Version = "v1",
        Description = "Une API pour gérer les utilisateurs, les professionnels et les clients."
    });
});

var app = builder.Build();

// Configurer la pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API de Gestion des Utilisateurs v1");
        c.RoutePrefix = string.Empty; // Swagger s'affiche à la racine
    });
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Lancer l'application
app.Run();
