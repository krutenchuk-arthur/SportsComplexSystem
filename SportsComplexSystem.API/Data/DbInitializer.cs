using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportsComplexSystem.API.Models;
using SportsComplexSystem.API.Models.Enums;

namespace SportsComplexSystem.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        if (!await context.Trainers.AnyAsync())
            await SeedCoreDataAsync(context);

        await SeedSettingsAndUsersAsync(context);
    }

    private static async Task SeedSettingsAndUsersAsync(AppDbContext context)
    {
        if (!await context.SystemSettings.AnyAsync())
        {
            context.SystemSettings.Add(new SystemSettings
            {
                ComplexName = "Спорткомплекс «Олімп»",
                WorkDayStartHour = 8,
                WorkDayEndHour = 22,
                DefaultMaxWeeklyHours = 40,
                DefaultMaintenanceThreshold = 200,
                WarningWearPercentage = 80
            });
            await context.SaveChangesAsync();
        }

        if (!await context.Users.AnyAsync())
        {
            var firstTrainer = await context.Trainers.OrderBy(t => t.Id).FirstOrDefaultAsync();
            var hasher = new PasswordHasher<User>();

            var users = new List<User>
            {
                new User { Username = "admin", Email = "admin@sport.ua", FullName = "Адміністратор комплексу", Role = UserRole.Admin },
                new User { Username = "trainer", Email = "trainer@sport.ua", FullName = firstTrainer?.FullName ?? "Демо тренер", Role = UserRole.Trainer, TrainerId = firstTrainer?.Id },
                new User { Username = "tech", Email = "tech@sport.ua", FullName = "Інженер технічного обслуговування", Role = UserRole.Technician }
            };
            var passwords = new[] { "admin123", "trainer123", "tech123" };

            for (var i = 0; i < users.Count; i++)
                users[i].PasswordHash = hasher.HashPassword(users[i], passwords[i]);

            context.Users.AddRange(users);
            await context.SaveChangesAsync();
            Console.WriteLine("Створено демо-акаунти: admin, trainer, tech.");
        }

        await BackfillUsernamesAsync(context);
    }

    /// <summary>
    /// Заповнює логін для акаунтів, створених до появи поля Username
    /// (легасі-бази після міграції AddUsername).
    /// </summary>
    private static async Task BackfillUsernamesAsync(AppDbContext context)
    {
        var pending = await context.Users.Where(u => u.Username == null).ToListAsync();
        if (pending.Count == 0) return;

        var taken = (await context.Users
                .Where(u => u.Username != null)
                .Select(u => u.Username!)
                .ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var user in pending)
        {
            var baseName = user.Email.Split('@')[0].Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(baseName)) baseName = $"user{user.Id}";

            var candidate = baseName;
            var suffix = 1;
            while (!taken.Add(candidate))
                candidate = $"{baseName}{++suffix}";

            user.Username = candidate;
        }

        await context.SaveChangesAsync();
        Console.WriteLine($"Заповнено логіни для {pending.Count} існуючих акаунтів.");
    }

    private static async Task SeedCoreDataAsync(AppDbContext context)
    {
        // 4 локації
        var locations = new[]
        {
            new Location { Name = "Тренажерна зала", Type = LocationType.GymHall },
            new Location { Name = "Зала групових занять", Type = LocationType.GroupHall },
            new Location { Name = "Кардіо-зона", Type = LocationType.CardioZone },
            new Location { Name = "Басейн", Type = LocationType.Pool }
        };
        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();

        // 8 тренерів
        var trainers = new[]
        {
            new Trainer { FullName = "Коваленко Олег Іванович", Specialization = SpecializationType.StrengthTraining, MaxWeeklyHours = 40, PhoneNumber = "+380501234567" },
            new Trainer { FullName = "Шевченко Марія Петрівна", Specialization = SpecializationType.Cardio, MaxWeeklyHours = 40, PhoneNumber = "+380671234568" },
            new Trainer { FullName = "Мельник Андрій Сергійович", Specialization = SpecializationType.CrossFit, MaxWeeklyHours = 40, PhoneNumber = "+380931234569" },
            new Trainer { FullName = "Ткаченко Юлія Володимирівна", Specialization = SpecializationType.Yoga, MaxWeeklyHours = 40, PhoneNumber = "+380501234570" },
            new Trainer { FullName = "Бондаренко Віктор Олександрович", Specialization = SpecializationType.Swimming, MaxWeeklyHours = 40, PhoneNumber = "+380671234571" },
            new Trainer { FullName = "Іваненко Оксана Михайлівна", Specialization = SpecializationType.StrengthTraining, MaxWeeklyHours = 40, PhoneNumber = "+380931234572" },
            new Trainer { FullName = "Гриценко Дмитро Васильович", Specialization = SpecializationType.Cardio, MaxWeeklyHours = 40, PhoneNumber = "+380501234573" },
            new Trainer { FullName = "Павленко Наталія Григорівна", Specialization = SpecializationType.Yoga, MaxWeeklyHours = 40, PhoneNumber = "+380671234574" }
        };
        context.Trainers.AddRange(trainers);
        await context.SaveChangesAsync();

        // Інвентар з різним ступенем зносу
        var equipment = new List<Equipment>
        {
            new Equipment { InventoryNumber = "INV-101", Name = "Бігова доріжка TechnoGym", LocationId = locations[2].Id, CurrentUsageHours = 145, MaintenanceThresholdHours = 200, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-102", Name = "Еліптичний тренажер", LocationId = locations[2].Id, CurrentUsageHours = 95, MaintenanceThresholdHours = 200, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-103", Name = "Велотренажер Spin", LocationId = locations[2].Id, CurrentUsageHours = 185, MaintenanceThresholdHours = 200, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-104", Name = "Бігова доріжка Matrix", LocationId = locations[2].Id, CurrentUsageHours = 205, MaintenanceThresholdHours = 200, Status = EquipmentStatus.MaintenanceRequired },
            new Equipment { InventoryNumber = "INV-201", Name = "Лавка для жиму", LocationId = locations[0].Id, CurrentUsageHours = 120, MaintenanceThresholdHours = 250, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-202", Name = "Штанга олімпійська 20кг", LocationId = locations[0].Id, CurrentUsageHours = 180, MaintenanceThresholdHours = 300, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-203", Name = "Силова рама", LocationId = locations[0].Id, CurrentUsageHours = 240, MaintenanceThresholdHours = 300, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-204", Name = "Гантелі набірні 2x20кг", LocationId = locations[0].Id, CurrentUsageHours = 55, MaintenanceThresholdHours = 250, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-301", Name = "Килимки для йоги (10 шт)", LocationId = locations[1].Id, CurrentUsageHours = 40, MaintenanceThresholdHours = 150, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-302", Name = "Степ-платформи (8 шт)", LocationId = locations[1].Id, CurrentUsageHours = 88, MaintenanceThresholdHours = 150, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-303", Name = "Фітболи (6 шт)", LocationId = locations[1].Id, CurrentUsageHours = 135, MaintenanceThresholdHours = 150, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-401", Name = "Дошки для плавання (15 шт)", LocationId = locations[3].Id, CurrentUsageHours = 98, MaintenanceThresholdHours = 180, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-402", Name = "Ласти тренувальні (10 пар)", LocationId = locations[3].Id, CurrentUsageHours = 160, MaintenanceThresholdHours = 180, Status = EquipmentStatus.Operational },
            new Equipment { InventoryNumber = "INV-501", Name = "Гирі 16кг CrossFit", LocationId = locations[1].Id, CurrentUsageHours = 210, MaintenanceThresholdHours = 220, Status = EquipmentStatus.Operational }
        };
        context.Equipment.AddRange(equipment);
        await context.SaveChangesAsync();

        // Заявки на ТО: одна для INV-104 (Open), одна для демо InProgress на вже зношеному INV-203
        context.MaintenanceTickets.Add(new MaintenanceTicket
        {
            EquipmentId = equipment.First(e => e.InventoryNumber == "INV-104").Id,
            Status = TicketStatus.Open,
            Description = "Перевищено ліміт напрацювання 200 год (поточне напрацювання: 205 год).",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        });
        await context.SaveChangesAsync();

        // Поточний тижневий розклад (понеділок - субота цього тижня)
        var now = DateTime.UtcNow;
        int diff = (7 + (now.DayOfWeek - DayOfWeek.Monday) % 7) % 7;
        var monday = now.Date.AddDays(-1 * diff);

        var scheduleSlots = new List<ScheduleSlot>
        {
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddHours(9), EndTime = monday.AddHours(11), Title = "Персональне тренування: силові вправи" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddHours(13), EndTime = monday.AddHours(16), Title = "Силові тренування: група B" },
            new ScheduleSlot { TrainerId = trainers[1].Id, LocationId = locations[2].Id, StartTime = monday.AddHours(10), EndTime = monday.AddHours(11.5), Title = "Кардіо-тренування для початківців" },
            new ScheduleSlot { TrainerId = trainers[3].Id, LocationId = locations[1].Id, StartTime = monday.AddHours(18), EndTime = monday.AddHours(19.5), Title = "Вечірня йога" },

            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(1).AddHours(9), EndTime = monday.AddDays(1).AddHours(12), Title = "Силові тренування: ранкова група" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(1).AddHours(14), EndTime = monday.AddDays(1).AddHours(16), Title = "Силові тренування: ноги" },
            new ScheduleSlot { TrainerId = trainers[4].Id, LocationId = locations[3].Id, StartTime = monday.AddDays(1).AddHours(16), EndTime = monday.AddDays(1).AddHours(17.5), Title = "Плавання для дорослих" },

            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(2).AddHours(9), EndTime = monday.AddDays(2).AddHours(12), Title = "Силові тренування: ранкова група" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(2).AddHours(14), EndTime = monday.AddDays(2).AddHours(17), Title = "Силові тренування: вечірня група" },
            new ScheduleSlot { TrainerId = trainers[2].Id, LocationId = locations[1].Id, StartTime = monday.AddDays(2).AddHours(10), EndTime = monday.AddDays(2).AddHours(12), Title = "CrossFit WOD" },
            new ScheduleSlot { TrainerId = trainers[1].Id, LocationId = locations[2].Id, StartTime = monday.AddDays(2).AddHours(19), EndTime = monday.AddDays(2).AddHours(20.5), Title = "HIIT кардіо" },

            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(3).AddHours(9), EndTime = monday.AddDays(3).AddHours(11), Title = "Силові: верх тіла" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(3).AddHours(14), EndTime = monday.AddDays(3).AddHours(17), Title = "Силові тренування: вечірня група" },
            new ScheduleSlot { TrainerId = trainers[7].Id, LocationId = locations[1].Id, StartTime = monday.AddDays(3).AddHours(11), EndTime = monday.AddDays(3).AddHours(12.5), Title = "Ранкова йога та медитація" },

            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(4).AddHours(9), EndTime = monday.AddDays(4).AddHours(12), Title = "Функціональний тренінг: ранок" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(4).AddHours(13), EndTime = monday.AddDays(4).AddHours(14.5), Title = "Персональне тренування" },
            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(4).AddHours(15), EndTime = monday.AddDays(4).AddHours(17), Title = "Функціональний тренінг" },
            new ScheduleSlot { TrainerId = trainers[1].Id, LocationId = locations[2].Id, StartTime = monday.AddDays(4).AddHours(18), EndTime = monday.AddDays(4).AddHours(19.5), Title = "Вечірнє кардіо" },

            new ScheduleSlot { TrainerId = trainers[0].Id, LocationId = locations[0].Id, StartTime = monday.AddDays(5).AddHours(10), EndTime = monday.AddDays(5).AddHours(12.5), Title = "Суботній силовий марафон" },
            new ScheduleSlot { TrainerId = trainers[4].Id, LocationId = locations[3].Id, StartTime = monday.AddDays(5).AddHours(11), EndTime = monday.AddDays(5).AddHours(13), Title = "Плавання: техніка" }
        };


        context.ScheduleSlots.AddRange(scheduleSlots);
        await context.SaveChangesAsync();

        Console.WriteLine("База даних успішно наповнена початковими даними.");
    }
}


