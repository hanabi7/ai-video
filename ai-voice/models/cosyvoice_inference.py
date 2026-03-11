# CosyVoice 模型推理脚本
# 需要先安装 CosyVoice: https://github.com/FunAudioLLM/CosyVoice

import argparse
import sys
import os
import torch
import torchaudio

# 添加 CosyVoice 路径
cosyvoice_path = os.environ.get('COSYVOICE_PATH', '../CosyVoice')
sys.path.insert(0, cosyvoice_path)

try:
    from cosyvoice.cli.cosyvoice import CosyVoice
    from cosyvoice.utils.file_utils import load_wav
except ImportError:
    print("CosyVoice 未安装，请先安装: https://github.com/FunAudioLLM/CosyVoice")
    print(f"期望路径: {cosyvoice_path}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='CosyVoice TTS 推理')
    parser.add_argument('--text', required=True, help='要合成的文本')
    parser.add_argument('--output', required=True, help='输出文件路径')
    parser.add_argument('--voice', default='cosyvoice_female_01', help='音色ID')
    parser.add_argument('--speed', type=float, default=1.0, help='语速 (0.5-2.0)')
    parser.add_argument('--emotion', default='neutral', help='情感类型')
    
    args = parser.parse_args()
    
    try:
        # 初始化模型
        print(f"正在加载 CosyVoice 模型...")
        model_dir = os.path.join(cosyvoice_path, 'pretrained_models/CosyVoice-300M')
        
        if not os.path.exists(model_dir):
            print(f"模型目录不存在: {model_dir}")
            print("请先下载 CosyVoice 预训练模型")
            sys.exit(1)
        
        cosyvoice = CosyVoice(model_dir)
        
        # 音色映射
        voice_mapping = {
            'cosyvoice_male_01': '中文男',
            'cosyvoice_female_01': '中文女',
            'cosyvoice_female_02': '中文女-活泼',
        }
        
        prompt_speech_name = voice_mapping.get(args.voice, '中文女')
        
        # 合成
        print(f"正在合成: {args.text[:50]}...")
        
        # 使用默认音色
        if args.emotion != 'neutral':
            # 带情感控制
            output = cosyvoice.inference_instruct2(
                args.text,
                f"用{args.emotion}的语气说话",
                prompt_speech_name,
                stream=False
            )
        else:
            # 普通合成
            output = cosyvoice.inference_sft(
                args.text,
                prompt_speech_name
            )
        
        # 调整语速（通过重采样）
        audio = next(output)['tts_speech']
        if args.speed != 1.0:
            # 调整采样率来改变语速
            orig_freq = 22050
            new_freq = int(orig_freq * args.speed)
            audio = torchaudio.functional.resample(audio, orig_freq=orig_freq, new_freq=new_freq)
        
        # 保存
        torchaudio.save(args.output, audio, 22050)
        print(f"合成完成: {args.output}")
        
    except Exception as e:
        print(f"合成失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
