export type userDto = {
  id: string;
  access_token: string;
  refresh_token: string;
};

export interface loginDto {
  id: string;
  password: string;
  PCUUID?: string;
  mobileUUID?: string;
}

export type RegistDto<T extends loginDto> = {};
