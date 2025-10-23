import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import roboto from '../../assets/Roboto-Regular.ttf';

Font.register({ family: 'Roboto', src: roboto });

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fefefe',
    padding: 25,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#2c3e50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottom: '2 solid #8b5cf6',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    objectFit: 'cover',
    marginRight: 20,
    border: '3 solid #8b5cf6',
    backgroundColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
    paddingTop: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: '#2c3e50',
    marginBottom: 5,
  },
  title: {
    fontSize: 13,
    color: '#8b5cf6',
    fontFamily: 'Roboto',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'Roboto',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8b5cf6',
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
    letterSpacing: 1,
    borderLeft: '4 solid #8b5cf6',
    paddingLeft: 8,
  },
  text: {
    marginBottom: 4,
    color: '#374151',
    fontFamily: 'Roboto',
    lineHeight: 1.5,
  },
  listItem: {
    marginLeft: 12,
    marginBottom: 3,
    fontFamily: 'Roboto',
    color: '#374151',
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 12,
    paddingLeft: 15,
    borderLeft: '2 solid #e5e7eb',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#2c3e50',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 10,
    color: '#8b5cf6',
    fontFamily: 'Roboto',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  experienceDate: {
    fontSize: 9,
    color: '#9ca3af',
    fontFamily: 'Roboto',
    marginBottom: 4,
    fontStyle: 'italic',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=8b5cf6&color=fff&size=128';

export const ElegantCV = ({ profile }: { profile: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.photo} src={profile.photo || defaultAvatar} />
        <View style={styles.headerContent}>
          <Text style={styles.name}>{profile.name || 'Ad Soyad'}</Text>
          <Text style={styles.title}>{profile.title || 'Meslek Unvanı'}</Text>
          <Text style={styles.contact}>{profile.email || 'email@example.com'}</Text>
          <Text style={styles.contact}>{profile.phone || '+90 555 123 45 67'}</Text>
          <Text style={styles.contact}>{profile.location || 'Şehir, Ülke'}</Text>
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