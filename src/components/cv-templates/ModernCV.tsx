import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import roboto from '../../assets/Roboto-Regular.ttf';

Font.register({ family: 'Roboto', src: roboto });

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f8fafc',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#1e293b',
  },
  header: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    objectFit: 'cover',
    marginRight: 15,
    border: '3 solid #fff',
    backgroundColor: '#e2e8f0',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: 'Roboto',
    opacity: 0.9,
  },
  contact: {
    fontSize: 9,
    fontFamily: 'Roboto',
    opacity: 0.8,
  },
  section: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 2,
  },
  text: {
    marginBottom: 3,
    fontFamily: 'Roboto',
    lineHeight: 1.4,
  },
  listItem: {
    marginLeft: 8,
    marginBottom: 2,
    fontFamily: 'Roboto',
    lineHeight: 1.3,
  },
  experienceItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#1e293b',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 10,
    color: '#3b82f6',
    fontFamily: 'Roboto',
    marginBottom: 2,
  },
  experienceDate: {
    fontSize: 9,
    color: '#64748b',
    fontFamily: 'Roboto',
    marginBottom: 3,
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=3b82f6&color=fff&size=128';

export const ModernCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.photo} src={profile.photo || defaultAvatar} />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{profile.name || 'Ad Soyad'}</Text>
          <Text style={styles.title}>{profile.title || 'Meslek Unvanı'}</Text>
          <Text style={styles.contact}>{profile.email || 'email@example.com'} | {profile.phone || '+90 555 123 45 67'} | {profile.location || 'Şehir, Ülke'}</Text>
        </View>
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