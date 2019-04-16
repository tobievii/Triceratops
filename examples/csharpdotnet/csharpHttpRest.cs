using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers; 
using System.Text;

namespace myApp
{
    class Program
    {

        private static readonly HttpClient client = new HttpClient();

        static void Main(string[] args)
        {

            string myJson = "{\"id\":\"csharpDevice\",\"data\":{\"temperature\":24.54,\"doorOpen\":false,\"gps\":{\"lat\":25.123,\"lon\":28.125}}}" ;
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", "YXBpOmtleS1tZnJhZGg2ZHJpdmJ5a3o3czRwM3ZseWVsamI4NjY2dg=="); // replace with your account Auth
            
            HttpResponseMessage response = client.PostAsync("http://localhost:8080/api/v3/data/post",new StringContent(myJson, Encoding.UTF8, "application/json")).Result;

            if (response.IsSuccessStatusCode)
            {
                var data = response.Content.ReadAsStringAsync().Result;
                Console.WriteLine(data);
            } else { Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase); }

            client.Dispose();
        }
    }
}