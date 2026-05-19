export type MembershipUploadedFile = {
  key: string
  name: string
  size: number
  type: string
  ufsUrl: string
}

export type MembershipApplicationFormValues = {
  lastName: string
  firstName: string
  middleName: string
  gender: string
  dateOfBirth: string
  civilStatus: string
  prcLicense: string
  dateOfRegistration: string
  contactNumber: string
  email: string
  region: string
  organization: string
  officeAddress: string
  position: string
  employmentStatus: string
  lengthOfService: string
  areaOfPractice: string
  degree: string
  school: string
  yearGraduated: string
  postgraduateStudies: string
  specializations: string
  otherOrganizations: string
  membershipType: string
  paymentMode: string
  paymentCategory: string
  isConventionAttendee: string
  resumeUpload: MembershipUploadedFile | null
  employmentProofUpload: MembershipUploadedFile | null
  prcLicenseUpload: MembershipUploadedFile | null
  endorsementUpload: MembershipUploadedFile | null
  certificateUpload: MembershipUploadedFile | null
  membershipPaymentProof: MembershipUploadedFile | null
  shirtIdPaymentProof: MembershipUploadedFile | null
  photoUpload: MembershipUploadedFile | null
  agreed: boolean
}

export type MembershipApplicationSuccess = {
  applicationNumber: string
  emailSent: boolean
  message: string
  debugUrl?: string
}

export const membershipFormDefaults: MembershipApplicationFormValues = {
  lastName: "",
  firstName: "",
  middleName: "",
  gender: "",
  dateOfBirth: "",
  civilStatus: "",
  prcLicense: "",
  dateOfRegistration: "",
  contactNumber: "",
  email: "",
  region: "",
  organization: "",
  officeAddress: "",
  position: "",
  employmentStatus: "",
  lengthOfService: "",
  areaOfPractice: "",
  degree: "",
  school: "",
  yearGraduated: "",
  postgraduateStudies: "",
  specializations: "",
  otherOrganizations: "",
  membershipType: "",
  paymentMode: "",
  paymentCategory: "",
  isConventionAttendee: "",
  resumeUpload: null,
  employmentProofUpload: null,
  prcLicenseUpload: null,
  endorsementUpload: null,
  certificateUpload: null,
  membershipPaymentProof: null,
  shirtIdPaymentProof: null,
  photoUpload: null,
  agreed: false,
}

export const membershipUploadFieldNames = [
  "resumeUpload",
  "employmentProofUpload",
  "prcLicenseUpload",
  "endorsementUpload",
  "certificateUpload",
  "membershipPaymentProof",
  "shirtIdPaymentProof",
  "photoUpload",
] as const
