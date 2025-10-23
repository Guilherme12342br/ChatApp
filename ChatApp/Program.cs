using ChatApp.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

var app = builder.Build();

app.MapGet("/", async context =>
{
    context.Response.Redirect("/views/index.html");
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://*:{port}");

app.UseStaticFiles();

app.MapHub<ChatHub>("/chatHub");

app.Run();
