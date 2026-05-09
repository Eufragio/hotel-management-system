using HotelSystem.Application;
using HotelSystem.Infrastructure;
using HotelSystem.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"[DEBUG] ContentRoot Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"[DEBUG] Connection String: {connectionString}");

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);



builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Configure Swagger/OpenAPI - TEMPORARILY DISABLED due to .NET 10 compatibility issues
// Swashbuckle.AspNetCore v6.x has TypeLoadException on .NET 10
// TODO: Re-enable when Swashbuckle releases .NET 10-compatible version
/*
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
*/

builder.Services.AddSignalR();

var app = builder.Build();

// Seed Database in Development
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            await HotelSystem.Infrastructure.Persistence.DbInitializer.SeedAsync(scope.ServiceProvider);
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}

// Swagger temporarily disabled - .NET 10 compatibility issues
/*
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel System API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Hotel Management System API Documentation";
    options.DisplayRequestDuration();
});
*/

// app.UseHttpsRedirection();

app.UseCors(builder =>
{
    builder.WithOrigins("http://localhost:5173") // Adjust port if needed
           .AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<HotelSystem.API.Hubs.NotificationHub>("/hubs/notifications");

app.Run();
