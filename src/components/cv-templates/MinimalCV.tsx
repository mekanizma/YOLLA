import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 11,
    color: '#2d3748',
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1 solid #e2e8f0',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    objectFit: 'cover',
    marginBottom: 15,
    border: '2 solid #f7fafc',
    backgroundColor: '#f7fafc',
    alignSelf: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#1a202c',
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    color: '#4a5568',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  contact: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d3748',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    marginBottom: 5,
    color: '#4a5568',
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 3,
    color: '#4a5568',
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
  },
  experienceItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: '1 solid #f7fafc',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2d3748',
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },
  experienceCompany: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },
  experienceDate: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 5,
    fontFamily: 'Helvetica-Oblique',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=2d3748&color=fff&size=128';

export const MinimalCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.photo} src={profile.photo || defaultAvatar} />
        <Text style={styles.name}>{profile.name || 'Ad Soyad'}</Text>
        <Text style={styles.title}>{profile.title || 'Meslek Unvanı'}</Text>
        <Text style={styles.contact}>{profile.email || 'email@example.com'} | {profile.phone || '+90 555 123 45 67'} | {profile.location || 'Şehir, Ülke'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkımda</Text>
        <Text style={styles.text}>{profile.about || 'Kendiniz hakkında kısa bir açıklama yazın. Deneyimlerinizi, hedeflerinizi ve kişisel özelliklerinizi özetleyin.'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beceriler</Text>
        <View>
          {(profile.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Problem Çözme', 'Takım Çalışması']).slice(0, 8).map((s: string, i: number) => (
            <Text key={i} style={styles.listItem}>• {s}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İş Deneyimi</Text>
        {(profile.experiences || [
          { title: 'Yazılım Geliştirici', company: 'ABC Teknoloji', date: '2022-2024', desc: 'Web uygulamaları geliştirme ve proje yönetimi' },
          { title: 'Stajyer', company: 'XYZ Şirketi', date: '2021-2022', desc: 'Frontend geliştirme ve test süreçleri' }
        ]).slice(0, 3).map((exp: any, i: number) => (
          <View key={i} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{exp.title}</Text>
            <Text style={styles.experienceCompany}>{exp.company}</Text>
            <Text style={styles.experienceDate}>{exp.date}</Text>
            <Text style={styles.text}>{exp.desc}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eğitim</Text>
        {(profile.educations || [
          { degree: 'Bilgisayar Mühendisliği', school: 'Üniversite Adı', date: '2018-2022', desc: 'Lisans derecesi' },
          { degree: 'Lise Diploması', school: 'Lise Adı', date: '2014-2018', desc: 'Fen Lisesi' }
        ]).slice(0, 2).map((edu: any, i: number) => (
          <View key={i} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{edu.degree}</Text>
            <Text style={styles.experienceCompany}>{edu.school}</Text>
            <Text style={styles.experienceDate}>{edu.date}</Text>
            <Text style={styles.text}>{edu.desc}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diller</Text>
        {(profile.languages || [
          { name: 'Türkçe', level: 'Ana Dil' },
          { name: 'İngilizce', level: 'İleri' },
          { name: 'Almanca', level: 'Orta' }
        ]).slice(0, 4).map((lang: any, i: number) => (
          <Text key={i} style={styles.listItem}>• {lang.name} ({lang.level})</Text>
        ))}
      </View>
    </Page>
  </Document>
); 