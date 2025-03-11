using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Ajouter les services pour les contrôleurs
builder.Services.AddControllers();

// Ajouter la connexion à la base de données
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Ajouter les services pour Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Ajouter des informations de base sur l'API
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API de Gestion des Utilisateurs",
        Version = "v1",
        Description = "Une API pour gérer les utilisateurs, les professionnels et les clients."
    });

    // Si tu as des commentaires XML, tu peux les inclure ici
    // var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    // var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    // c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// Configurer la pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API de Gestion des Utilisateurs v1");
        c.RoutePrefix = string.Empty;  // Affiche Swagger à la racine
    });
}

app.UseHttpsRedirection();

// Ajouter le middleware pour les contrôleurs
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Lancer l'application
app.Run();
