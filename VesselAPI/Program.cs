using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using VesselAPI.Data;
Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development"); //Force the development environment

var builder = WebApplication.CreateBuilder(args);

//register services for dependency injection, including controllers, Swagger, and the database context.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Vessel API For North Standard Interview",
        Description = "API for managing vessels and associated bluecards. Built with ASP.NET Core and Entity Framework Core.",
        Version = "v1"
    });
});


//Configure CORS to allow requests from the React frontend running on localhost:3000
builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});



builder.Services.AddDbContext<VesselDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseCors("AllowReact"); //Apply the CORS policy to the application.

//Enable swagger in development.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//Use Outside of development
app.UseSwagger();
app.UseSwaggerUI();

//Start Application with HTTPS redirection, authorization, and controller routing.
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();