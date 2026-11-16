using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Models;

namespace SportsComplexSystem.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Trainer> Trainers => Set<Trainer>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Equipment> Equipment => Set<Equipment>();
    public DbSet<ScheduleSlot> ScheduleSlots => Set<ScheduleSlot>();
    public DbSet<MaintenanceTicket> MaintenanceTickets => Set<MaintenanceTicket>();
    public DbSet<User> Users => Set<User>();
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Equipment: унікальний інвентарний номер
        modelBuilder.Entity<Equipment>()
            .HasIndex(e => e.InventoryNumber)
            .IsUnique();

        // ScheduleSlot: індекси для швидкої перевірки колізій
        modelBuilder.Entity<ScheduleSlot>()
            .HasIndex(s => new { s.TrainerId, s.StartTime });

        modelBuilder.Entity<ScheduleSlot>()
            .HasIndex(s => new { s.LocationId, s.StartTime });

        // ScheduleSlot -> Trainer (Restrict, щоб не видаляти тренера з активним розкладом)
        modelBuilder.Entity<ScheduleSlot>()
            .HasOne(s => s.Trainer)
            .WithMany(t => t.ScheduleSlots)
            .HasForeignKey(s => s.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);

        // ScheduleSlot -> Location (Restrict)
        modelBuilder.Entity<ScheduleSlot>()
            .HasOne(s => s.Location)
            .WithMany(l => l.ScheduleSlots)
            .HasForeignKey(s => s.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Equipment -> Location (Restrict)
        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.Location)
            .WithMany(l => l.Equipment)
            .HasForeignKey(e => e.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        // MaintenanceTicket -> Equipment (Restrict, не видаляти обладнання з активними заявками)
        modelBuilder.Entity<MaintenanceTicket>()
            .HasOne(t => t.Equipment)
            .WithMany(e => e.MaintenanceTickets)
            .HasForeignKey(t => t.EquipmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // ScheduleSlot <-> Equipment: implicit many-to-many (EF Core 8 skip navigation)
        modelBuilder.Entity<ScheduleSlot>()
            .HasMany(s => s.Equipment)
            .WithMany(e => e.ScheduleSlots)
            .UsingEntity(j => j.ToTable("ScheduleSlotEquipment"));

        // Enum -> string зберігання в PostgreSQL для читабельності
        modelBuilder.Entity<Trainer>()
            .Property(t => t.Specialization)
            .HasConversion<string>();

        modelBuilder.Entity<Location>()
            .Property(l => l.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Equipment>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.Entity<MaintenanceTicket>()
            .Property(t => t.Status)
            .HasConversion<string>();

        // User: унікальний email, роль як string, тренер-профіль опціональний
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Username опціональний (легасі-акаунти), тому унікальність перевіряємо лише для заповнених значень
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique()
            .HasFilter("\"Username\" IS NOT NULL");

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Trainer)
            .WithMany()
            .HasForeignKey(u => u.TrainerId)
            .OnDelete(DeleteBehavior.SetNull);

        // Грошові поля: numeric(10,2) у PostgreSQL
        modelBuilder.Entity<Trainer>()
            .Property(t => t.HourlyRate)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MaintenanceTicket>()
            .Property(t => t.RepairCost)
            .HasPrecision(10, 2);

        // AuditLog: швидка вибірка останніх подій для стрічки аудиту
        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => a.Timestamp);
    }
}
