# Download Miniconda

Link resmi: https://docs.anaconda.com/miniconda/

1. Jalankan file .exe hasil download.
2. Pilih Just Me (umumnya).
3. Centang Add Miniconda to PATH (optional, tapi disarankan).

4. Klik install.
5. restart terminal.

### Cek Verisi

```sh
conda --version
```

### Update Conda

```sh
conda update conda -y
```

# Environment

## 1. Buat environment Baru

Contoh buat environment `env_roadmodel` dengan Python 3.10:

```sh
conda create -n env_roadmodel python=3.10
```

Aktifkan:

```sh
conda activate env_roadmodel
```

Keluar:

```sh
conda deactivate
```

## 2. Lihat Daftar environment

```sh
conda env list
```

## 3. Hapus environment

```sh
conda env remove --name <nama_env>
```

### Bersihkan cache

```sh
conda clean --all -y
```

## 4. Clone environment

```sh
conda create --name <env_lama> --clone <env_baru>
```

# Install Package

Contoh:

```sh
pip install <nama_paket>
```

Atau:

```sh
conda install numpy pandas
```

## Install Package dari `requerement.txt`

```sh
pip install -r requirements.txt
```

Simpan ke file `requirements.txt`:

```sh
pip freeze > requirements.txt
```
