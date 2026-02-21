# INSTAL `CUDA`

```sh
conda create -n <nama_env> python=3.10 -y
```

```sh
conda activate <nama_env>
```

```sh
conda install -c conda-forge cudatoolkit=11.2 cudnn=8.1.0
```

```sh
python -m pip install "tensorflow<2.11"
```

Wajib downgrade `NumPy` ke versi <2:

```sh
pip install numpy==1.23.5 --force-reinstall
```
