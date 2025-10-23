import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import roboto from '../../assets/Roboto-Regular.ttf';

Font.register({ family: 'Roboto', src: roboto });

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fef7ff',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#2d1b69',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: '#667eea',
    color: 'white',
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    objectFit: 'cover',
    marginRight: 20,
    border: '4 solid #fff',
    backgroundColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    marginBottom: 5,
    color: '#fff',
  },
  title: {
    fontSize: 13,
    color: '#e0e7ff',
    fontFamily: 'Roboto',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: 9,
    color: '#c7d2fe',
    fontFamily: 'Roboto',
    lineHeight: 1.3,
  },
  section: {
    marginBottom: 18,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
    border: '1 solid #e0e7ff',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#667eea',
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
    letterSpacing: 1,
    borderBottom: '2 solid #667eea',
    paddingBottom: 3,
  },
  text: {
    marginBottom: 4,
    color: '#4c1d95',
    fontFamily: 'Roboto',
    lineHeight: 1.5,
  },
  listItem: {
    marginLeft: 12,
    marginBottom: 3,
    fontFamily: 'Roboto',
    color: '#4c1d95',
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1 solid #e0e7ff',
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#2d1b69',
    marginBottom: 2,
  },
  experienceCompany: {
    fontSize: 10,
    color: '#667eea',
    fontFamily: 'Roboto',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  experienceDate: {
    fontSize: 9,
    color: '#8b5cf6',
    fontFamily: 'Roboto',
    marginBottom: 4,
    fontStyle: 'italic',
  },
});

const defaultAvatar = 'https://ui-avatars.com/api/?name=CV&background=667eea&color=fff&size=128';

export const CreativeCV = ({ profile }: { profile: any }) => (
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