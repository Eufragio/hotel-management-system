namespace HotelSystem.Domain.Entities;

public class Settings
{
    public Guid Id { get; set; }
    
    // Company Information
    public string CompanyName { get; set; } = "Hotel Sistema";
    public string DocumentNumber { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string Website { get; set; } = "";
    public string? LogoBase64 { get; set; } // Base64 encoded image
    
    // Regional Settings
    public string Currency { get; set; } = "USD";
    public string CurrencySymbol { get; set; } = "$";
    public string TimeZone { get; set; } = "America/Lima";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string TimeFormat { get; set; } = "24h"; // 12h or 24h
    
    // System Settings
    public string Language { get; set; } = "es";
    public int SessionTimeout { get; set; } = 30; // minutes
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
