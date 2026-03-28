param(
    [string]$OutputDir = ".\Deliverables\ppt_samples"
)

$ErrorActionPreference = "Stop"

function Set-TextStyle {
    param(
        $TextRange,
        [int]$FontSize = 20,
        [string]$FontName = "Malgun Gothic",
        [int]$Rgb = 0x1F2937,
        [int]$Bold = 0
    )

    $TextRange.Font.Name = $FontName
    $TextRange.Font.Size = $FontSize
    $TextRange.Font.Bold = $Bold
    $TextRange.Font.Color.RGB = $Rgb
}

function Add-Background {
    param($Slide, [int]$Rgb)
    $Slide.FollowMasterBackground = $false
    $Slide.Background.Fill.Solid()
    $Slide.Background.Fill.ForeColor.RGB = $Rgb
}

function Add-TitleBand {
    param($Slide, [string]$Title, [string]$Subtitle, [int]$BandRgb, [int]$AccentRgb)

    Add-Background -Slide $Slide -Rgb 0xF7F8FA

    $band = $Slide.Shapes.AddShape(1, 0, 0, 960, 95)
    $band.Fill.ForeColor.RGB = $BandRgb
    $band.Line.Visible = 0

    $accent = $Slide.Shapes.AddShape(1, 36, 110, 180, 8)
    $accent.Fill.ForeColor.RGB = $AccentRgb
    $accent.Line.Visible = 0

    $titleBox = $Slide.Shapes.AddTextbox(1, 38, 18, 820, 40)
    $titleRange = $titleBox.TextFrame.TextRange
    $titleRange.Text = $Title
    Set-TextStyle -TextRange $titleRange -FontSize 28 -FontName "Malgun Gothic" -Rgb 0xFFFFFF -Bold -1

    $subtitleBox = $Slide.Shapes.AddTextbox(1, 38, 122, 860, 28)
    $subtitleRange = $subtitleBox.TextFrame.TextRange
    $subtitleRange.Text = $Subtitle
    Set-TextStyle -TextRange $subtitleRange -FontSize 16 -FontName "Malgun Gothic" -Rgb 0x4B5563
}

function Add-BulletPanel {
    param(
        $Slide,
        [string]$Heading,
        [string[]]$Bullets,
        [float]$Left,
        [float]$Top,
        [float]$Width,
        [float]$Height,
        [int]$FillRgb,
        [int]$HeadingRgb
    )

    $panel = $Slide.Shapes.AddShape(1, $Left, $Top, $Width, $Height)
    $panel.Fill.ForeColor.RGB = $FillRgb
    $panel.Line.Visible = 0

    $head = $Slide.Shapes.AddTextbox(1, $Left + 18, $Top + 14, $Width - 36, 28)
    $headRange = $head.TextFrame.TextRange
    $headRange.Text = $Heading
    Set-TextStyle -TextRange $headRange -FontSize 18 -Rgb $HeadingRgb -Bold -1

    $body = $Slide.Shapes.AddTextbox(1, $Left + 20, $Top + 52, $Width - 40, $Height - 68)
    $body.TextFrame.WordWrap = -1
    $range = $body.TextFrame.TextRange
    $range.Text = [string]::Join("`r", ($Bullets | ForEach-Object { "• $_" }))
    Set-TextStyle -TextRange $range -FontSize 18 -Rgb 0x1F2937
    $range.ParagraphFormat.Bullet.Visible = 0
    $range.ParagraphFormat.SpaceAfter = 8
}

function Add-QuestionSlide {
    param(
        $Presentation,
        [hashtable]$Question,
        [string]$DeckTitle,
        [int]$BandRgb,
        [int]$AccentRgb
    )

    $slide = $Presentation.Slides.Add($Presentation.Slides.Count + 1, 12)
    Add-TitleBand -Slide $slide -Title "$DeckTitle - 형성평가" -Subtitle $Question.Title -BandRgb $BandRgb -AccentRgb $AccentRgb

    Add-BulletPanel -Slide $slide -Heading "문항" -Bullets $Question.Prompt -Left 36 -Top 170 -Width 430 -Height 300 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
    Add-BulletPanel -Slide $slide -Heading "정답과 해설" -Bullets $Question.Answer -Left 494 -Top 170 -Width 430 -Height 300 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
}

function Save-Presentation {
    param($Presentation, [string]$PptPath, [string]$PdfPath)
    $Presentation.SaveAs($PptPath)
    $Presentation.SaveAs($PdfPath, 32)
}

function New-Deck {
    param(
        $PowerPoint,
        [string]$Title,
        [string]$Subtitle,
        [hashtable[]]$Questions,
        [string[]]$Goals,
        [string[]]$Misconceptions,
        [string[]]$Feedback,
        [string[]]$Retry,
        [string[]]$Rubric,
        [int]$BandRgb,
        [int]$AccentRgb,
        [string]$PptPath,
        [string]$PdfPath
    )

    $presentation = $PowerPoint.Presentations.Add()

    $s1 = $presentation.Slides.Add(1, 12)
    Add-TitleBand -Slide $s1 -Title $Title -Subtitle $Subtitle -BandRgb $BandRgb -AccentRgb $AccentRgb
    Add-BulletPanel -Slide $s1 -Heading "학습 목표" -Bullets $Goals -Left 36 -Top 180 -Width 420 -Height 260 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
    Add-BulletPanel -Slide $s1 -Heading "오늘의 흐름" -Bullets @("개념 확인", "예제 살펴보기", "형성평가", "오개념 점검", "재도전 활동") -Left 488 -Top 180 -Width 436 -Height 260 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb

    $s2 = $presentation.Slides.Add(2, 12)
    Add-TitleBand -Slide $s2 -Title $Title -Subtitle "핵심 개념과 예시" -BandRgb $BandRgb -AccentRgb $AccentRgb
    Add-BulletPanel -Slide $s2 -Heading "핵심 개념" -Bullets $Questions[0].Concept -Left 36 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
    Add-BulletPanel -Slide $s2 -Heading "예시" -Bullets $Questions[0].Example -Left 494 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb

    foreach ($question in $Questions) {
        Add-QuestionSlide -Presentation $presentation -Question $question -DeckTitle $Title -BandRgb $BandRgb -AccentRgb $AccentRgb
    }

    $sLast1 = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    Add-TitleBand -Slide $sLast1 -Title $Title -Subtitle "오개념과 교사용 피드백" -BandRgb $BandRgb -AccentRgb $AccentRgb
    Add-BulletPanel -Slide $sLast1 -Heading "예상 오개념" -Bullets $Misconceptions -Left 36 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
    Add-BulletPanel -Slide $sLast1 -Heading "교사용 피드백" -Bullets $Feedback -Left 494 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb

    $sLast2 = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
    Add-TitleBand -Slide $sLast2 -Title $Title -Subtitle "재도전 활동과 평가 기준" -BandRgb $BandRgb -AccentRgb $AccentRgb
    Add-BulletPanel -Slide $sLast2 -Heading "재도전 활동" -Bullets $Retry -Left 36 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb
    Add-BulletPanel -Slide $sLast2 -Heading "간단 평가 기준" -Bullets $Rubric -Left 494 -Top 170 -Width 430 -Height 320 -FillRgb 0xFFFFFF -HeadingRgb $AccentRgb

    Save-Presentation -Presentation $presentation -PptPath $PptPath -PdfPath $PdfPath
    $presentation.Close()
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$powerPoint = New-Object -ComObject PowerPoint.Application
$powerPoint.Visible = -1

try {
    $mathQuestions = @(
        @{
            Title = "문항 1"
            Concept = @(
                "점의 시작 위치를 확인한다.",
                "오른쪽/왼쪽은 가로 이동, 위/아래는 세로 이동이다.",
                "몇 칸 이동했는지 정확히 센다."
            )
            Example = @(
                "(2, 3)에서 오른쪽으로 2칸 이동하면 (4, 3)이다.",
                "가로값만 변하고 세로값은 그대로다."
            )
            Prompt = @(
                "점 A가 (2, 3)에 있다.",
                "오른쪽으로 4칸 이동한 점의 위치를 말해 보자."
            )
            Answer = @(
                "정답: (6, 3)",
                "해설: 가로 방향으로만 4칸 이동했으므로 첫 번째 위치값만 4 커진다."
            )
        },
        @{
            Title = "문항 2"
            Prompt = @(
                "점 B가 (5, 4)에 있다.",
                "아래로 2칸 이동한 점의 위치를 말해 보자."
            )
            Answer = @(
                "정답: (5, 2)",
                "해설: 세로 방향으로 아래로 2칸 이동했으므로 두 번째 위치값이 2 줄어든다."
            )
        },
        @{
            Title = "문항 3"
            Prompt = @(
                "점 C가 (1, 2)에 있다.",
                "오른쪽으로 3칸, 위로 2칸 이동하였다. 최종 위치를 말해 보자."
            )
            Answer = @(
                "정답: (4, 4)",
                "해설: 오른쪽 이동은 가로값 변화, 위로 이동은 세로값 변화를 뜻한다."
            )
        },
        @{
            Title = "문항 4"
            Prompt = @(
                "점 D가 (4, 5)에서 (2, 5)로 이동했다.",
                "어느 방향으로 몇 칸 이동했는가."
            )
            Answer = @(
                "정답: 왼쪽으로 2칸",
                "해설: 세로값은 같고 가로값만 4에서 2로 줄었다."
            )
        }
    )

    New-Deck -PowerPoint $powerPoint `
        -Title "초4 수학 - 평면에서 점의 이동" `
        -Subtitle "2022 개정 교육과정 공개 연수자료를 참고한 MVP 샘플" `
        -Questions $mathQuestions `
        -Goals @(
            "점의 시작 위치를 말할 수 있다.",
            "점이 이동한 방향을 말할 수 있다.",
            "이동한 칸 수를 세어 설명할 수 있다.",
            "최종 위치를 설명할 수 있다."
        ) `
        -Misconceptions @(
            "오른쪽/왼쪽 이동과 위/아래 이동을 바꾸어 이해함",
            "칸 수를 셀 때 시작 칸까지 포함해서 세는 오류",
            "위치 설명과 이동 설명을 구분하지 못함",
            "최종 위치를 말해야 하는데 과정만 말함"
        ) `
        -Feedback @(
            "학생이 방향어를 정확히 쓰는지 본다.",
            "시작점과 도착점을 구분하는지 확인한다.",
            "칸 수를 셀 때 시작 칸을 포함하지 않도록 지도한다.",
            "두 단계 이동은 한 단계씩 분리해 설명하게 한다."
        ) `
        -Retry @(
            "재도전 1: 점 F가 (2, 2)에 있다. 위로 1칸, 오른쪽으로 2칸 이동하면 어디에 있는가.",
            "재도전 2: 점 G가 (6, 3)에서 (4, 1)로 이동했다. 왼쪽으로 몇 칸, 아래로 몇 칸 이동했는가."
        ) `
        -Rubric @(
            "상: 위치, 방향, 칸 수를 모두 정확히 설명할 수 있다.",
            "중: 한 번 이동 문제는 해결하지만 두 단계 이동에서 설명이 흔들린다.",
            "하: 방향과 칸 수를 자주 혼동하거나 위치 표현이 불안정하다."
        ) `
        -BandRgb 0x1D4ED8 `
        -AccentRgb 0xF59E0B `
        -PptPath (Join-Path $OutputDir "grade4_math_point_movement.pptx") `
        -PdfPath (Join-Path $OutputDir "grade4_math_point_movement.pdf")

    $koreanQuestions = @(
        @{
            Title = "문항 1"
            Concept = @(
                "겪은 일은 차례가 드러나게 말하고 쓴다.",
                "먼저, 그리고, 다음에, 마지막에 같은 순서 표현을 사용할 수 있다.",
                "한 문장에는 한 가지 일을 중심으로 쓴다."
            )
            Example = @(
                "먼저 놀이터에 갔다.",
                "그리고 그네를 탔다.",
                "마지막에 집에 돌아왔다."
            )
            Prompt = @(
                "다음 문장을 차례에 맞게 다시 배열해 보자.",
                "놀이터에 갔다 / 그네를 탔다 / 집에 돌아왔다"
            )
            Answer = @(
                "정답: 놀이터에 갔다 -> 그네를 탔다 -> 집에 돌아왔다",
                "해설: 일이 일어난 순서대로 배열한다."
            )
        },
        @{
            Title = "문항 2"
            Prompt = @(
                "빈칸에 알맞은 말을 넣어 보자.",
                "나는 토요일에 공원에 갔다. _____ 친구를 만났다. _____ 같이 놀았다."
            )
            Answer = @(
                "예시 정답: 먼저 / 그리고",
                "해설: 앞뒤 사건의 차례가 자연스럽게 이어지면 된다."
            )
        },
        @{
            Title = "문항 3"
            Prompt = @(
                "다음 중 겪은 일을 순서대로 말한 것을 고르자.",
                "1) 재미있었다. 학교에 갔다. 아침을 먹었다.",
                "2) 아침을 먹었다. 학교에 갔다. 재미있는 일이 있었다."
            )
            Answer = @(
                "정답: 2번",
                "해설: 일어난 차례가 자연스럽게 이어진다."
            )
        },
        @{
            Title = "문항 4"
            Prompt = @(
                "다음 상황을 보고 두 문장으로 써 보자.",
                "운동장에 갔다 / 공을 찼다"
            )
            Answer = @(
                "예시 답안: 나는 운동장에 갔다. 그리고 공을 찼다.",
                "해설: 순서 표현을 써서 두 문장으로 나누면 더 분명하다."
            )
        }
    )

    New-Deck -PowerPoint $powerPoint `
        -Title "초2 국어 - 겪은 일을 순서대로 말하고 쓰기" `
        -Subtitle "국어 자료 존재 확인을 바탕으로 만든 MVP 저신뢰 샘플" `
        -Questions $koreanQuestions `
        -Goals @(
            "겪은 일을 시간 순서에 맞게 말할 수 있다.",
            "순서 표현을 사용할 수 있다.",
            "중요한 일을 빠뜨리지 않고 간단한 문장으로 쓸 수 있다.",
            "듣는 사람이 이해하기 쉽게 차례를 살려 말할 수 있다."
        ) `
        -Misconceptions @(
            "시간 순서가 섞임",
            "먼저/그리고/마지막 같은 연결 표현을 쓰지 않음",
            "느낌만 말하고 실제 사건은 빠짐",
            "한 문장에 너무 많은 일을 넣어 뜻이 흐려짐"
        ) `
        -Feedback @(
            "학생이 사건의 순서를 지키는지 본다.",
            "한 문장에 한 가지 일 중심으로 쓰게 돕는다.",
            "언제, 어디서, 무엇을 질문으로 내용을 확장한다.",
            "결과보다 과정이 드러나는지 살핀다."
        ) `
        -Retry @(
            "재도전 1: 그림 3장을 보고 먼저-그리고-마지막을 넣어 한 번 말해 보자.",
            "재도전 2: 오늘 아침에 한 일을 세 문장으로 써 보자."
        ) `
        -Rubric @(
            "상: 차례가 분명하고 순서 표현을 알맞게 사용한다.",
            "중: 차례는 대체로 맞지만 표현이 단순하거나 일부 빠진다.",
            "하: 사건의 순서가 섞이거나 문장이 끊겨 의미 전달이 어렵다."
        ) `
        -BandRgb 0x059669 `
        -AccentRgb 0xEA580C `
        -PptPath (Join-Path $OutputDir "grade2_korean_sequence.pptx") `
        -PdfPath (Join-Path $OutputDir "grade2_korean_sequence.pdf")
}
finally {
    if ($powerPoint) {
        $powerPoint.Quit()
    }
}

Get-ChildItem $OutputDir | Select-Object Name, Length | Sort-Object Name
