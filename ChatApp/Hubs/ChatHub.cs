using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private static ConcurrentDictionary<string, string> connectedUsers = new ConcurrentDictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (connectedUsers.TryRemove(Context.ConnectionId, out string username))
            {
                await Clients.All.SendAsync("UpdateUserList", connectedUsers.Values);
                await Clients.All.SendAsync("ReceiveMessage", "Sistema", $"{username} saiu do chat");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task RegisterUser(string username)
        {
            connectedUsers[Context.ConnectionId] = username;
            await Clients.All.SendAsync("UpdateUserList", connectedUsers.Values);
            await Clients.All.SendAsync("ReceiveMessage", "Sistema", $"{username} entrou do chat");
        }

        public async Task SendMessage (string user, string message)
        {
            // envia mensagem para todos que estão conectados
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
