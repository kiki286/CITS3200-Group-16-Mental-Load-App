//CITS3200 project group 23 2024
//Admin screen to edit survey links/IDs

import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native'
import { auth } from '../../../firebase/config'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'

const SurveySettings = ({ navigation }) => {
  const [checkinInput, setCheckinInput] = useState('')
  const [demographicsInput, setDemographicsInput] = useState('')
  const [loading, setLoading] = useState(false)

  const extractQualtricsId = (value) => {
    if (!value) return ''
    // Common Qualtrics survey IDs start with SV_
    const svMatch = value.match(/SV_[A-Za-z0-9]+/)
    if (svMatch) return svMatch[0]
    try {
      const url = new URL(value)
      // Try typical query params that may contain survey id
      const paramKeys = ['SID', 'surveyId', 'SurveyID', 'id']
      for (const k of paramKeys) {
        const v = url.searchParams.get(k)
        if (v && /SV_[A-Za-z0-9]+/.test(v)) return v.match(/SV_[A-Za-z0-9]+/)[0]
        if (v && /^[A-Za-z0-9_\-]+$/.test(v)) return v
      }
      // Fallback: last path segment that looks like an id
      const segs = url.pathname.split('/').filter(Boolean)
      const last = segs[segs.length - 1]
      if (last && /SV_[A-Za-z0-9]+/.test(last)) return last.match(/SV_[A-Za-z0-9]+/)[0]
      if (last && /^[A-Za-z0-9_\-]+$/.test(last)) return last
    } catch (_) {
      // not a URL; treat as raw id
      if (/^[A-Za-z0-9_\-]+$/.test(value)) return value
    }
    return ''
  }

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.EXPO_PUBLIC_BACKEND_URL
        if (!base) return
        const token = await auth?.currentUser?.getIdToken?.()
        const res = await fetch(`${base}/admin/surveys`, {
          method: 'GET',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (res.ok) {
          const json = await res.json()
          const s = json?.surveys || json || {};
          setCheckinInput(s.checkin_survey || s.checkinSurveyId || '');
          setDemographicsInput(s.demographics_survey || s.demographicsSurveyId || '');
        }
      } catch (e) {
        // ignore if endpoint not available yet
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!checkinInput.trim() || !demographicsInput.trim()) {
      Alert.alert('Validation', 'Both survey identifiers are required.')
      return
    }
    const normalizedCheckin = extractQualtricsId(checkinInput.trim())
    const normalizedDemo = extractQualtricsId(demographicsInput.trim())
    if (!normalizedCheckin || !normalizedDemo) {
      Alert.alert('Validation', 'Could not detect valid survey IDs from inputs.')
      return
    }
    try {
      const base = process.env.EXPO_PUBLIC_BACKEND_URL
      if (!base) {
        Alert.alert('Not configured', 'Backend URL is not set. Define EXPO_PUBLIC_BACKEND_URL.')
        return
      }
      setLoading(true)
      const token = await auth?.currentUser?.getIdToken?.()
      const res = await fetch(`${base}/admin/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ checkinSurveyId: normalizedCheckin, demographicsSurveyId: normalizedDemo })
      })
      setLoading(false)
      if (res.ok) {
        Alert.alert('Saved', 'Survey configuration updated.')
        navigation.goBack()
      } else {
        const t = await res.text()
        Alert.alert('Error', t || 'Failed to save')
      }
    } catch (e) {
      setLoading(false)
      Alert.alert('Error', Platform.OS === 'web' ? String(e) : 'Failed to save')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Survey Settings</Text>

      <Text style={styles.label}>Check-in Survey Link or ID (Qualtrics)</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste full Qualtrics link or SV_… ID"
        placeholderTextColor={COLORS.almost_white}
        value={checkinInput}
        onChangeText={setCheckinInput}
        autoCapitalize="none"
      />
      {!!checkinInput && (
        <Text style={styles.helper}>Detected ID: {extractQualtricsId(checkinInput) || '—'}</Text>
      )}

      <Text style={styles.label}>Demographics Survey Link or ID (Qualtrics)</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste full Qualtrics link or SV_… ID"
        placeholderTextColor={COLORS.almost_white}
        value={demographicsInput}
        onChangeText={setDemographicsInput}
        autoCapitalize="none"
      />
      {!!demographicsInput && (
        <Text style={styles.helper}>Detected ID: {extractQualtricsId(demographicsInput) || '—'}</Text>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Saving…' : 'Save'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: COLORS.almost_white,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.almost_white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.almost_white,
    fontFamily: FONTS.main_font,
  },
})

export default SurveySettings


