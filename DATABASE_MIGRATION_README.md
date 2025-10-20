# Veritabanı Şeması Düzeltmesi

## Sorun
UUID formatındaki ID'ler (`0e573ad4-d182-4a58-9549-52b11e81dcd1`) bigint beklenen alanlara gönderilmeye çalışılıyor. Bu durum "invalid input syntax for type bigint" hatasına neden oluyor.

## Çözüm
Veritabanı şemasını UUID tipine çevirmek gerekiyor.

## Uygulama Adımları

### 1. Supabase Dashboard'a Giriş
- Supabase projenizin dashboard'una gidin
- Sol menüden "SQL Editor" seçin

### 2. Migration Dosyasını Çalıştırın
- `database_migration.sql` dosyasının içeriğini kopyalayın
- SQL Editor'a yapıştırın
- "Run" butonuna tıklayın

### 3. Sonuç Kontrolü
Migration başarılı olduktan sonra:
- Başvuru sistemi çalışacak
- UUID'ler doğru şekilde işlenecek
- Foreign key ilişkileri korunacak

## Önemli Notlar
- Bu migration mevcut verileri korur
- Foreign key constraint'leri yeniden oluşturur
- Index'leri optimize eder
- Geri alınamaz bir işlemdir (backup alın)

## Alternatif Çözüm
Eğer migration yapmak istemiyorsanız, veritabanı şemasını manuel olarak düzenleyebilirsiniz:
1. Supabase Dashboard > Table Editor
2. İlgili tabloları açın
3. Column tiplerini uuid olarak değiştirin
