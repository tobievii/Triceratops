// uncomment below to test "workflow" processing
// packet.data.test = "hello world"

var summary = {
    person : packet.data.head_commit.author.name,
    timestamp : packet.timestamp,
    repo : packet.data.repository.full_name,
    message : packet.data.head_commit.message,
    url : packet.data.head_commit.url
}

var messageDiscord = summary.person + " just "+summary.message + " in " + summary.repo + " link: " + summary.url

discord.sendmsg("494073723268235264", "GITHUB: "+messageDiscord)

callback(packet); 