using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Charger les variables d'environnement
builder.Configuration.AddEnvironmentVariables();

var dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? "localhost"; // Default à "localhost" si non défini

var connectionString = $"Server={dbServer};Database=SiteDB;Trusted_Connection=True;TrustServerCertificate=True";

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)
);

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API de Gestion des Utilisateurs v1");
        c.RoutePrefix = string.Empty; // Swagger s'affiche à la racine
    });
}
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());


app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
