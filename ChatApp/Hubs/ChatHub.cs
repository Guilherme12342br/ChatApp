using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage (string user, string message)
        {
            // envia mensagem para todos que estão conectados
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
