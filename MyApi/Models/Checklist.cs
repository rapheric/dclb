namespace MyApi.Models;

public class Checklist
{
    public int Id { get; set; }
    public string DclNo { get; set; }

    public string CustomerId { get; set; }
    public string CustomerNo { get; set; }
    public string CustomerNumber { get; set; }
    public string CustomerName { get; set; }
    public string Product { get; set; }
    public string LoanType { get; set; }

    public string Rm { get; set; }
    public string AssignedToRM { get; set; }
    public string AssignedToCoChecker { get; set; }
    public string CreatedBy { get; set; }

    public List<ChecklistItem> ChecklistItems { get; set; } = new();

    public string Status { get; set; } = "co_creator_review";

    public int Progress { get; set; } = 0;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public bool SubmittedToCoChecker { get; set; }

    public string RmComment { get; set; }
    public string CoComment { get; set; }

    public List<DocumentCategory> Documents { get; set; } = new();

    public List<ActivityLog> Logs { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
