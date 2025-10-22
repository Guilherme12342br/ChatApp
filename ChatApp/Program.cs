using ChatApp.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();

var app = builder.Build();

app.MapGet("/", async context =>
{
    context.Response.Redirect("/views/index.html");
});

app.UseStaticFiles();

app.MapHub<ChatHub>("/chatHub");

app.Run();
