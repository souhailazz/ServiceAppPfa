using System.Text.Json;

public class DialogflowResponse
{
    public QueryResult queryResult { get; set; }
}

public class QueryResult
{
    public string queryText { get; set; }
    public string action { get; set; }
    public Intent intent { get; set; }
    public Dictionary<string, JsonElement> parameters { get; set; }
}

public class Intent
{
    public string displayName { get; set; }
}
