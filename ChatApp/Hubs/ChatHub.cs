using ChatApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private static ConcurrentDictionary<string, UserInfo> connectedUsers = new ConcurrentDictionary<string, UserInfo>();

        private static readonly Random random = new();

        private static readonly string[] ColorPalette = new[]
        {
            "#FF2900", "#0098AB", "#9E00B3", "#00A859", "A0C900", "#D69D00", "9E3126", "#2CCC00", "#1F5ABF"
        };

        public async Task RegisterUser(string username)
        {


            var userInfo = new UserInfo
            {
                connectionId = Context.ConnectionId,
                username = username,
                color = ColorPalette[random.Next(ColorPalette.Length)]
            };

            connectedUsers[Context.ConnectionId] = userInfo;

            await Clients.All.SendAsync("UserJoined", username, userInfo.color);
            await Clients.All.SendAsync("UpdateUserList", connectedUsers.Values.Select(u => u.username)); 
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (connectedUsers.TryRemove(Context.ConnectionId, out var user))
            {
                await Clients.All.SendAsync("UpdateUserList", connectedUsers.Values.Select(u => u.username));
                await Clients.All.SendAsync("UserOut", user.username, user.color);
            }
            await base.OnDisconnectedAsync(exception);
        }


        public async Task SendMessage(string username, string message)
        {
            if (connectedUsers.TryGetValue(Context.ConnectionId, out var user))
            {
                await Clients.All.SendAsync("ReceiveMessage", user.username, message,user.color );
            }
        }
        public async Task SendImage(string username, string base64Image)
        {
            if (connectedUsers.TryGetValue(Context.ConnectionId, out var user))
            {
                await Clients.All.SendAsync("ReceiveImage", user.username, base64Image,user.color );
            }
        }
    }
}
